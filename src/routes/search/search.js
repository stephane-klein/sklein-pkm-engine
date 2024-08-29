import esClient from "$lib/server/elasticsearch.js";

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

export default async function search({
    tags = null,
    createdAfter = null,
    createdBefore = null,
    notesByPage = 50,
    returnTags = false,
    queryString = ""
} = {}) { 
    queryString = queryString.trim().replace(/"/g, '\\"');
    const [ notesResult, aggsResult, countNewNotes, countOldNotes ] = await Promise.all([
        esClient.search({
            index: "notes",
            body: {
                _source: ["title", "created_at", "filename", "content_html", "tags"],
                size: notesByPage,
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    note_type: "journal_note"
                                }
                            },
                            (
                                (queryString != "")
                                    ? {
                                        query_string: {
                                            query: queryString,
                                            default_field: "content_html"
                                        }
                                    }
                                    : undefined
                            ),
                            (
                                (Array.isArray(tags) && tags.length > 0)
                                    ? {
                                        bool: {
                                            must: tags.map(tag => ({
                                                term: {
                                                    tags: tag
                                                }
                                            }))
                                        }
                                    }
                                    : undefined
                            ),
                            {
                                range: {
                                    created_at: {
                                        lt: createdBefore || undefined,
                                        gt: createdAfter || undefined
                                    }
                                }
                            }
                        ].filter(Boolean)
                    }
                },
                sort: [
                    {
                        created_at: {
                            order: (
                                (createdAfter !== null)
                                    ? "asc"
                                    : "desc"
                            )
                        }
                    }
                ]
            }
        }),
        esClient.search({
            index: "notes",
            body: {
                size: 0,
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    note_type: "journal_note"
                                }
                            },
                            (
                                (queryString != "")
                                    ? {
                                        query_string: {
                                            query: queryString,
                                            default_field: "content_html"
                                        }
                                    }
                                    : undefined
                            ),
                            (
                                (Array.isArray(tags) && tags.length > 0)
                                    ? {
                                        bool: {
                                            must: tags.map(tag => ({
                                                term: {
                                                    tags: tag
                                                }
                                            }))
                                        }
                                    }
                                    : undefined
                            )
                        ].filter(Boolean)
                    }
                },
                aggs: (
                    returnTags
                        ? {
                            tags_count: {
                                terms: {
                                    field: "tags",
                                    size: 100
                                }
                            }
                        }
                        : undefined
                )
            }
        }),
        (((createdBefore === null) && (createdAfter === null))
            ? 0
            : (
                esClient.count({
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
                                    (
                                        (queryString != "")
                                            ? {
                                                query_string: {
                                                    query: queryString,
                                                    default_field: "content_html"
                                                }
                                            }
                                            : undefined
                                    ),
                                    (
                                        (Array.isArray(tags) && tags.length > 0)
                                            ? {
                                                bool: {
                                                    must: tags.map(tag => ({
                                                        term: {
                                                            tags: tag
                                                        }
                                                    }))
                                                }
                                            }
                                            : undefined
                                    ),
                                    {
                                        range: {
                                            created_at: {
                                                gte: createdBefore || undefined,
                                                gt: createdAfter || undefined
                                            }
                                        }
                                    }
                                ].filter(Boolean)
                            }
                        }
                    }
                })
            )
        ),
        esClient.count({
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
                            (
                                (queryString != "")
                                    ? {
                                        query_string: {
                                            query: queryString,
                                            default_field: "content_html"
                                        }
                                    }
                                    : undefined
                            ),
                            (
                                (Array.isArray(tags) && tags.length > 0)
                                    ? {
                                        bool: {
                                            must: tags.map(tag => ({
                                                term: {
                                                    tags: tag
                                                }
                                            }))
                                        }
                                    }
                                    : undefined
                            ),
                            {
                                range: {
                                    created_at: {
                                        lt: createdBefore || undefined,
                                        gt: createdAfter || undefined
                                    }
                                }
                            }
                        ].filter(Boolean)
                    }
                }
            }
        })
    ]);

    let notes = notesResult.hits.hits;
    if (createdAfter !== null) {
        notes = notes.reverse();
    }

    return {
        countNotes: notesResult.hits.total.value,
        countNewNotes: (
            (createdAfter === null)
                ? countNewNotes?.count || 0
                : (
                    (notesByPage >= countNewNotes.count)
                        ? 0
                        : countNewNotes.count - notesByPage
                )
        ),
        countOldNotes: (
            (createdAfter === null)
                ? (
                    (notesByPage >= countOldNotes.count)
                        ? 0
                        : countOldNotes.count - notesByPage
                )
                : countOldNotes?.count || 0
        ),
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
