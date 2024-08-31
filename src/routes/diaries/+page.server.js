import esClient from "$lib/server/elasticsearch.js";
const notesByPage = 50;

function groupByDay(notes) {
    return notes.reduce((acc, note) => {
        let date = note._source.created_at.substring(0, 10);

        if (!acc[date]) {
            acc[date] = [];
        }

        acc[date].push(note);

        return acc;
    }, {});
}

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

    const createdAfter = url.searchParams.get("created_after");
    const createdBefore = url.searchParams.get("created_before");

    /* Build currentPageResultQuery */
    const currentPageResultQuery = structuredClone(baseQuery);
    currentPageResultQuery.body._source = ["title", "created_at", "filename", "content_html", "tags"];
    currentPageResultQuery.body.size = notesByPage;

    currentPageResultQuery.body.query.bool.must.push(
        {
            range: {
                created_at: {
                    lt: createdBefore || undefined,
                    gt: createdAfter || undefined
                }
            }
        }
    );

    currentPageResultQuery.body.sort = [
        {
            created_at: {
                order: (
                    (createdAfter !== null)
                        ? "asc"
                        : "desc"
                )
            }
        }
    ];

    /* Build aggsResultQuery*/
    const aggsResultQuery = structuredClone(baseQuery);
    aggsResultQuery.body.aggs = {
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
        esClient.search(currentPageResultQuery),
        esClient.search(aggsResultQuery),
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
        notesByDay: groupByDay(notes),
        tags: (aggsResult?.aggregations?.tags_count?.buckets || []).filter(
            (tag) => {
                return !tags.includes(tag.key);
            }
        )
   };
}
