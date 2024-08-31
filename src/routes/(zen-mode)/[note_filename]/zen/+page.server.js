import esClient from "$lib/server/elasticsearch.js";

export async function load({params}) {
    const noteResult = await esClient.search({
        index: "notes",
        body: {
            _source: ["title", "created_at", "note_type", "content_html", "tags"],
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
    });

    return {
        note: noteResult.hits.hits[0]
    };
}
