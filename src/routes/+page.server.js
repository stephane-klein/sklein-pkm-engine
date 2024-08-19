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

const notesByPage = 20;

export async function load({url}) {
    const createdAfter = url.searchParams.get("created_after");
    const createdBefore = url.searchParams.get("created_before");

    const [ notesResult, countNewNotes, countOldNotes ] = await Promise.all([
        esClient.search({
            index: "notes",
            body: {
                _source: ["title", "created_at", "filename", "content_html", "tags"],
                size: notesByPage,
                query: {
                    bool: {
                        filter: [
                            {
                                terms: {
                                    note_type: ["fleeting_note"]
                                }
                            },
                            {
                                range: {
                                    created_at: {
                                        lt: createdBefore || undefined,
                                        gt: createdAfter || undefined
                                    }
                                }
                            }
                        ]
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
        (((createdBefore === null) && (createdAfter === null))
            ? 0
            : (
                esClient.count({
                    index: "notes",
                    body: {
                        query: {
                            bool: {
                                filter: [
                                    {
                                        terms: {
                                            note_type: ["fleeting_note"]
                                        },
                                    },
                                    {
                                        range: {
                                            created_at: {
                                                gte: createdBefore || undefined,
                                                gt: createdAfter || undefined
                                            }
                                        }
                                    }
                                ]
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
                        filter: [
                            {
                                terms: {
                                    note_type: ["fleeting_note"]
                                },
                            },
                            {
                                range: {
                                    created_at: {
                                        lt: createdBefore || undefined,
                                        gt: createdAfter || undefined
                                    }
                                }
                            }
                        ]
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
        countNewNotes: (
            (createdAfter === null)
                ? countNewNotes?.count || 0
                : (countNewNotes.count - notesByPage)
        ),
        countOldNotes: (
            (createdAfter === null)
                ? (countOldNotes.count - notesByPage)
                : countOldNotes?.count || 0
        ),
        firstNote:notes[0], 
        lastNote: notes.at(-1),
        notesByDay: groupByDay(notes)
    };
}
