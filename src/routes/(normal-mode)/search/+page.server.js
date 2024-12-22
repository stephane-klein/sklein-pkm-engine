import esClient from "$lib/server/elasticsearch.js";
const notesByPage = 50;

export async function load({url}) {
    const tags = url.searchParams.getAll("tags");
    const queryString = (decodeURIComponent(url.searchParams.get("q") || "")).trim().replace(/"/g, '\\"');
    const noteType = url.searchParams.get("note_type") || "";
    const page = parseInt(url.searchParams.get("page") || 1, 10);

    /* Build baseQuery used by all other queries */
    const baseQuery = {
        index: "notes",
        body: {
            query: {
                bool: {
                    must: [
                    ]
                }
            }
        }
    };

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

    if (queryString !== "") {
        baseQuery.body.query.bool.must.push({
            multi_match: {
                query: queryString,
                fields: ["title^2", "content_html"],
                fuzziness: "AUTO",
                type: "best_fields"
            }
        });
    }

    /* Build currentPageResultQuery */
    const currentPageQuery = structuredClone(baseQuery);
    currentPageQuery.body._source = ["title", "created_at", "filename", "content_html", "tags"];
    currentPageQuery.body.from = notesByPage * (page - 1);
    currentPageQuery.body.size = notesByPage;
    currentPageQuery.body.sort = [
        "_score",
        {
            created_at: {
                order: "desc"
            }
        }
    ];

    if (queryString !== "") {
        currentPageQuery.body._source.splice(currentPageQuery.body._source.indexOf("content_html"), 1);
        currentPageQuery.body.highlight = {
            fields : {
                content : {},
                content_html: {
                    number_of_fragments: 0,
                    pre_tags: [`<em class="hightlight">`], 
                    post_tags: ["</em>"]
                }
            }
        };

    }
    if (noteType !== "") {
        currentPageQuery.body.query.bool.must.push({
            term: {
                note_type: noteType
            }
        });
    }

    /* Build aggsTagsResultQuery*/
    const aggsTagsQuery = structuredClone(baseQuery);
    aggsTagsQuery.body.size = 0;
    aggsTagsQuery.body.aggs = {
        tags_count: {
            terms: {
                field: "tags",
                size: 10000
            }
        }
    };
    if (noteType !== "") {
        aggsTagsQuery.body.query.bool.must.push({
            term: {
                note_type: noteType
            }
        });
    }

    /* Build aggsNoteTypesResultQuery*/
    const aggsNoteTypesQuery = structuredClone(baseQuery);
    aggsNoteTypesQuery.body.size = 0;
    aggsNoteTypesQuery.body.aggs = {
        note_type_count: {
            terms: {
                field: "note_type",
                size: 10000
            }
        }
    };

    const [ notesResult, aggsTagsResult, aggsNoteTypesResult] = await Promise.all([
        esClient.search(currentPageQuery),
        esClient.search(aggsTagsQuery),
        esClient.search(aggsNoteTypesQuery),
    ]);

    let notes = notesResult.hits.hits;

    let countNotesInPreviousPages = (page - 1) * notesByPage;
    if (countNotesInPreviousPages < 0) countNotesInPreviousPages = 0;

    let countNotesInNextPages = notesResult.hits.total.value - (page * notesByPage);
    if (countNotesInNextPages < 0) countNotesInNextPages = 0;

    return {
        totalNotesInAllPages: (
            notesResult.hits.total.value
        ),
        countNotesInPreviousPages: countNotesInPreviousPages,
        countNotesInNextPages: countNotesInNextPages,
        notes: notes,
        tags: (aggsTagsResult?.aggregations?.tags_count?.buckets || []).filter(
            (tag) => {
                return !tags.includes(tag.key);
            }
        ),
        noteTypes: (aggsNoteTypesResult?.aggregations?.note_type_count?.buckets || [])
    };
}
