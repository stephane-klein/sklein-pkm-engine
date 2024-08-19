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

const notesByPage = 5;

export async function load({url}) {
    const createdAfter = url.searchParams.get("created_after");
    const createdBefore = url.searchParams.get("created_before");

    let { hits: notes } = (await esClient.search({
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
    })).hits;

    if (createdAfter !== null) {
        notes = notes.reverse();
    }

    const countNewNotes = (
        ((createdBefore === null) && (createdAfter === null))
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
                                    lt: createdBefore || undefined,
                                    gt: createdAfter || undefined
                                }
                            }
                        }
                    ]
                }
            }
        }
    })).count;

    return {
        countNewNotes: (
            (createdAfter === null)
                ? countNewNotes
                : (countNewNotes - notesByPage)
        ),
        countOldNotes: (
            (createdAfter === null)
                ? (countOldNotes - notesByPage)
                : countOldNotes
        ),
        firstNote:notes[0], 
        lastNote: notes.at(-1),
        notesByDay: groupByDay(notes)
    };
}
