import esClient from "$lib/server/elasticsearch.js";

function groupByFirstLetter(notes) {
    return notes.reduce((acc, note) => {
        let firstLetter = note._source.title.substring(0, 1).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!(/^[A-Z]$/.test(firstLetter))) {
            firstLetter = "";
        };

        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }

        acc[firstLetter].push(note);

        return acc;
    }, {});
}

export async function load({url}) {
    /* Build baseQuery used by all other queries */
    const query = {
        index: "notes",
        body: {
            size: 10000,
            _source: ["title", "note_type", "filename"],
            query: {
                bool: {
                    must_not: [
                        {
                            term: {
                                note_type: "journal_note"
                            }
                        },
                        {
                            term: {
                                note_type: "unlisted"
                            }
                        }
                    ]
                }
            },
            aggs: {
                tags_count: {
                    terms: {
                        field: "tags",
                        size: 10000
                    }
                },
            },
            sort: [
                {
                    "title.keyword": {
                        order: "asc"
                    }
                }
            ]
        }
    };
    const tags = url.searchParams.getAll("tags");

    if (tags.length > 0) {
        query.body.query.bool.must = [{
            bool: {
                must: tags.map(tag => ({
                    term: {
                        tags: tag
                    }
                }))
            }
        }];
    }
    const notesResult = await esClient.search(query);
    return {
        notesGroupedByFirstLetter: groupByFirstLetter(notesResult.hits.hits),
        tags: (notesResult?.aggregations?.tags_count?.buckets || []).filter(
            (tag) => {
                return !tags.includes(tag.key);
            }
        )
    };
};
