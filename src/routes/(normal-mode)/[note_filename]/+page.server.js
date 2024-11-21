import { error } from "@sveltejs/kit";
import esClient from "$lib/server/elasticsearch.js";

export async function load({params}) {
    const [noteResult, backlinkNotesResult] = await Promise.all([
        esClient.search({
            index: "notes",
            body: {
                _source: ["title", "note_type", "content_html", "tags", "created_at"],
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
        }),
        esClient.search({
            index: "notes",
            body: {
                _source: ["title", "filename", "note_type", "content_html", "tags", "created_at"],
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    note_type: "journal_note"
                                }
                            },
                            {
                                terms: {
                                    linked_notes: [params.note_filename]
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
        })
    ]);

    if (!noteResult.hits.hits[0]) {
        throw error(404, 'Page not found');
    }
    return {
        note: noteResult.hits.hits[0],
        backlink_notes: backlinkNotesResult.hits.hits
    };
}
