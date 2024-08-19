import esClient from "$lib/server/elasticsearch.js";

export async function load({params}) {
    const note = (await esClient.search({
        index: "notes",
        body: {
            _source: ["title", "note_type", "content_html", "tags"],
            query: {
                bool: {
                    filter: [
                        {
                            terms: {
                                filename: [params.note_filename]
                            }
                        },
                    ]
                }
            },
        }
    })).hits.hits[0];

    const { hits: backlink_notes} = (await esClient.search({
        index: "notes",
        body: {
            _source: ["title", "filename", "note_type", "content_html", "tags", "created_at"],
            query: {
                bool: {
                    filter: [
                        {
                            terms: {
                                linked_notes: [params.note_filename]
                            }
                        },
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

    console.dir(backlink_notes, {depth: null});

    /*
    if (note) {
        data.backlink_notes = data.backlink_notes.map((note) => {
            return {
                html: md.render(note?.content || ""),
                ...note
            };
        });
    } else {
        error(404, 'Not Found');
    }
    */

    return {
        note,
        backlink_notes
    };
}
