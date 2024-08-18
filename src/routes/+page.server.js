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

// const notesByPage = 50;

export async function load() {
    // const createdAfter = url.searchParams.get("created_after");
    // const createdBefore = url.searchParams.get("created_before");

    const { hits: notes } = (await esClient.search({
        index: "notes",
        body: {
            _source: ["title", "created_at", "filename", "content_html", "tags"],
            size: 3,
            query: {
                bool: {
                    filter: [
                        {
                            terms: {
                                note_type: ["fleeting_note"]
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

    return {
        countNewNotes: 0,
        countOldNotes: 0,
        firstNote:notes[0], 
        lastNote: notes.at(-1),
        notesByDay: groupByDay(notes)
    };
}
