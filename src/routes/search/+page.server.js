import esClient from "$lib/server/elasticsearch.js";
const notesByPage = 50;

export async function load({url}) {
    /* Build baseQuery used by all other queries */
    const baseQuery = {
        index: "notes",
        body: {
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                note_type: "journal_note"
                            }
                        },
                    ]
                }
            }
        }
    };
    const tags = url.searchParams.getAll("tags");

    if (tags.length > 0) {
        baseQuery.body.query.bool.must.push(
            {
                bool: {
                    must: tags.map(tag => ({
                        term: {
                            tags: tag
                        }
                    }))
                }
            }
        );
    }

    const queryString = (url.searchParams.get("q") || "").trim().replace(/"/g, '\\"');
    if (queryString !== "") {
        baseQuery.body.query.bool.must.push({
            query_string: {
                query: queryString,
                default_field: "content_html"
            }
        });
    }

    const createdAfter = url.searchParams.get("created_after");
    const createdBefore = url.searchParams.get("created_before");

    /* Build currentPageResultQuery */
    const currentPageQuery = structuredClone(baseQuery);
    currentPageQuery.body._source = ["title", "created_at", "filename", "content_html", "tags"];
    currentPageQuery.body.size = notesByPage;

    currentPageQuery.body.query.bool.must.push(
        {
            range: {
                created_at: {
                    lt: createdBefore || undefined,
                    gt: createdAfter || undefined
                }
            }
        }
    );
    if (queryString !== "") {
        currentPageQuery.body._source.splice(currentPageQuery.body._source.indexOf("content_html"), 1);
        currentPageQuery.body.highlight = {
            fields : {
                content : {},
                content_html: {
                    number_of_fragments: 0
                }
            }
        };
    }

    /* Build aggsResultQuery*/
    const aggsQuery = structuredClone(baseQuery);
    aggsQuery.body.size = 0;
    aggsQuery.body.aggs = {
        tags_count: {
            terms: {
                field: "tags",
                size: 10000
            }
        }
    };

    /* Build countNewNotesQuery */
    let countNewNotesQuery;
    if ((createdBefore !== null) || (createdAfter !== null)) {
        countNewNotesQuery = structuredClone(baseQuery);
        countNewNotesQuery.body.query.bool.must.push({
            range: {
                created_at: {
                    gte: createdBefore || undefined,
                    gt: createdAfter || undefined
                }
            }
        });
   }

   /* Build countOldNotesQuery */
   const countOldNotesQuery = structuredClone(baseQuery);
   countOldNotesQuery.body.query.bool.must.push({
        range: {
            created_at: {
                lt: createdBefore || undefined,
                gt: createdAfter || undefined
            }
        }
   });

   const [ notesResult, aggsResult, countNewNotesResult, countOldNotesResult ] = await Promise.all([
        esClient.search(currentPageQuery),
        esClient.search(aggsQuery),
        (
            (countNewNotesQuery)
                ? esClient.count(countNewNotesQuery)
                : { count: 0 }
        ),
        esClient.count(countOldNotesQuery),
   ]);

   let notes = notesResult.hits.hits;
   if (createdAfter !== null) {
        notes = notes.reverse();
   }

   const countNewNotes = (
        (createdAfter === null)
                ? countNewNotesResult?.count || 0
                : (
                    (notesByPage >= countNewNotesResult.count)
                        ? 0
                        : countNewNotesResult.count - notesByPage
                )
   );

   const countOldNotes = (
        (createdAfter === null)
            ? (
                (notesByPage >= countOldNotesResult.count)
                    ? 0
                    : countOldNotesResult.count - notesByPage
            )
            : countOldNotesResult?.count || 0
   );

   return {
        totalNotesInAllPages: (
            notesResult.hits.total.value + countNewNotes + countOldNotes
        ),
        countNewNotes: countNewNotes,
        countOldNotes: countOldNotes,
        firstNote:notes[0], 
        lastNote: notes.at(-1),
        notes: notes,
        tags: (aggsResult?.aggregations?.tags_count?.buckets || []).filter(
            (tag) => {
                return !tags.includes(tag.key);
            }
        )
   };
}
