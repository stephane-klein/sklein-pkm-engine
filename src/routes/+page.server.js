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

export async function load({url}) {
    // const createdAfter = url.searchParams.get("created_after");
    const createdBefore = url.searchParams.get("created_before");

    const { hits: notes } = (await esClient.search({
        index: "notes",
        body: {
            _source: ["title", "created_at", "filename", "content_html", "tags"],
            size: 20,
            search_after: undefined,
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
                                    lt: createdBefore || undefined
                                }
                            }
                        }
                    ]
                }
            },
            sort: [
                {
                    created_at: {
                        order: "desc"
                    }
                }
            ]
        }
    })).hits;

    const countNewNotes = (
        (createdBefore === null)
            ? 0
            : (
                await esClient.count({
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
                                                gt: createdBefore || undefined
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                })
            ).count
    );

    const countOldNotes = (await esClient.count({
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
                                    lt: createdBefore || undefined
                                }
                            }
                        }
                    ]
                }
            }
        }
    })).count;

    return {
        countNewNotes: countNewNotes,
        countOldNotes: countOldNotes - 20,
        firstNote:notes[0], 
        lastNote: notes.at(-1),
        notesByDay: groupByDay(notes)
    };
}
