import esClient from "$lib/server/elasticsearch.js";

function groupByFirstLetter(notes) {
    return notes.reduce((acc, note) => {
        let firstLetter = note._source.title.substring(0, 1);

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
                    ]
                }
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
    const notes = await esClient.search(query);
    return {
        notesGroupedByFirstLetter: groupByFirstLetter(notes.hits.hits)
    };
};
