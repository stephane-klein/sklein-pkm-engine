#!/usr/bin/env node
import { fileURLToPath } from "url";
import path from "path";
import { glob } from "glob";
import { Client } from "@elastic/elasticsearch";
import matter from "gray-matter";
import yaml from "js-yaml";
import { Listr } from "listr2";
import { extractLinksAndTags } from "./utils.js";
import md from "./src/lib/server/markdown.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.chdir(__dirname);

const client = new Client({
    node: process.env.ELASTICSEARCH_URL || "http://localhost:9200"
});

let ctx = {
    notesIndiceExists: false,
    contentAbsPath: path.resolve(".", process.env.CONTENT_PATH || "content/"),
    allFilenameOfNotesInElasticsearch: [],
    allFilepathOfNotesOnTheFileSystem: []
};

const tasks = new Listr(
    [
        {
            title: `Check if "notes" indice exists in Elasticsearch database`,
            task: async(ctx, task) => {
                ctx.notesIndiceExists = await client.indices.exists({ index: "notes" });
                if (ctx.notesIndiceExists) {
                    task.title = `Check if "notes" indice exists in Elasticsearch database: Yes`;
                } else {
                    task.title = `Check if "notes" indice exists in Elasticsearch database: No`;
                }
            }
        },
        {
            title: `Create "notes" indice`,
            skip: (ctx) => ctx.notesIndiceExists,
            task: async() => {
                // If you modify this data model, you must delete the database with the following script:
                //
                // $ ./reset-es-database.js
                //
                await client.indices.create({
                    index: "notes",
                    body: {
                        settings: {
                            analysis: {
                                analyzer: {
                                    french_analyzer: {
                                        type: "custom",
                                        tokenizer: "standard",
                                        filter: [
                                            "lowercase",
                                            "asciifolding",
                                            "french_elision",
                                            "french_stop",
                                            "french_stemmer"
                                        ]
                                    },
                                    french_html_analyzer: {
                                        type: "custom",
                                        tokenizer: "standard",
                                        filter: [
                                            "lowercase",
                                            "asciifolding",
                                            "french_elision",
                                            "french_stop",
                                            "french_stemmer"
                                        ],
                                        char_filter: [
                                            "html_strip"
                                        ]
                                    }
                                },
                                filter: {
                                    french_elision: {
                                        type: "elision",
                                        articles_case: true,
                                        articles: [
                                            "l", "m", "t", "qu", "n", "s", "j", "d", "c", "jusqu", "quoiqu", "lorsqu", "puisqu"
                                        ]
                                    },
                                    french_stop: {
                                        type: "stop",
                                        stopwords: "_french_"
                                    },
                                    french_stemmer: {
                                        type: "stemmer",
                                        language: "light_french"
                                    }
                                }
                            }
                        },
                        mappings: {
                            properties: {
                                title: {
                                    type: "text",
                                    analyzer: "french_analyzer",
                                    fields: {
                                        keyword: {
                                            type: "keyword"
                                        }
                                    }
                                },
                                filename: {
                                    type: "keyword"
                                },
                                created_at: {
                                    type: "date",
                                    format: "yyyy-MM-dd HH:mm:ss"
                                },
                                note_type: {
                                    type: "keyword"
                                },
                                linked_notes: {
                                    type: "keyword"
                                },
                                tags: {
                                    type: "keyword"
                                },
                                content: {
                                    type: "text",
                                    analyzer: "french_analyzer"
                                },
                                content_html: {
                                    type: "text",
                                    analyzer: "french_html_analyzer"
                                }
                            }
                        }
                    }
                });
            }
        },
        {
            title: "Loads the names of all notes already in the Elasticsearch database",
            task: async(ctx) => {
                // List used later to delete all notes that no longer exist
                ctx.allFilenameOfNotesInElasticsearch = (
                    await client.search({
                        index: "notes",
                        body: {
                            query: {
                                match_all: {}
                            },
                            stored_fields: [],
                            _source: false
                        },
                        size: 10000
                    })
                ).hits.hits.map((row) => row._id);
            }
        },
        {
            title: "Loads a list of all note files to be processed",
            task: async(ctx) => {
                ctx.allFilepathOfNotesOnTheFileSystem = await glob(
                    "/src/**/*.md",
                    {
                        cwd: ctx.contentAbsPath,
                        root: ctx.contentAbsPath,
                        dot: false,
                        ignore: [
                            "src/Templates/**",
                            "src/attachments/**"
                        ]
                    }
                );
            }
        },
        {
            title: "Upload notes from filesystem to database",
            task: async(ctx, task) => {
                let index = 0;
                const contentAbsPathLength = ctx.contentAbsPath.length;
                for await (const filePath of ctx.allFilepathOfNotesOnTheFileSystem) {
                    index++;
                    task.title = `Upload notes from filesystem to database (${index}/${ctx.allFilepathOfNotesOnTheFileSystem.length})`;
                    const fileName = path.parse(path.basename(filePath)).name;
                    const relativeFilePath = filePath.substring(contentAbsPathLength);

                    const data = matter.read(filePath, {
                        engines: {
                            yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA })
                        }
                    });
                    if (
                        (data.data.draft === true) ||
                            (data.data.draft === "true")
                    ) {
                        task.output = `Skip draft note: ${relativeFilePath}`;
                        continue;
                    } else {
                        task.output = `Load ${relativeFilePath} to database`;
                    }

                    const [WikiLinks, Tags] = extractLinksAndTags(data.content);
                    data.data.tags = [...new Set([...data.data?.tags || [], ...Tags])];

                    await client.index({
                        index: "notes",
                        id: fileName,
                        document: {
                            filename: fileName,
                            created_at: (data.data.created_at && (data.data.type === "journal_note")) ? data.data.created_at + ":00" : null,
                            title: data.data?.title || ((data.data.type !== "journal_note") ? path.parse(fileName).name : undefined),
                            note_type: data.data?.type || null,
                            linked_notes: WikiLinks,
                            tags: data.data?.tags || [],
                            content: data.content,
                            content_html: md.render(data.content)
                        },
                    });
                    const fileNameIndex = ctx.allFilenameOfNotesInElasticsearch.findIndex((item) => item === fileName);
                    if (fileNameIndex > -1) {
                        ctx.allFilenameOfNotesInElasticsearch.splice(fileNameIndex, 1);
                    }
                }
            },
        },
        {
            title: "Delete any notes still present in the database but which have been deleted from the filesystem",
            task: async(ctx, task) => {
                let index = 0;
                task.title = `Delete any notes still present in the database but which have been deleted from the filesystem (${index}/${ctx.allFilenameOfNotesInElasticsearch.length})`;
                for (const fileName of ctx.allFilenameOfNotesInElasticsearch) {
                    index++;
                    task.title = `Delete any notes still present in the database but which have been deleted from the filesystem (${index}/${ctx.allFilenameOfNotesInElasticsearch.length})`;
                    task.output = `Delete "${fileName}" note from database`;
                    await client.delete({
                        index: "notes",
                        id: fileName
                    });
                }
            }
        }
    ],
    {
        ctx,
        rendererOptions: {
            suffixSkips: true
        }
    }
);

try {
    await tasks.run();
} catch (e) {
    console.error(e);
}
