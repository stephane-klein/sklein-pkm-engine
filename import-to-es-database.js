#!/usr/bin/env node
import { fileURLToPath } from "url";
import path from "path";
import { glob } from "glob";
import { Client } from "@elastic/elasticsearch";
import matter from "gray-matter";
import yaml from "js-yaml";
import { extractLinksAndTags } from "./utils.js";
import md from "./src/lib/server/markdown.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    node: process.env.ELASTICSEARCH_URL || "http://localhost:9200"
});

if (!await client.indices.exists({ index: "notes" })) {

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

// List used later to delete all notes that no longer exist
const allNoteFileNames = (
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

process.chdir(__dirname);

const contentAbsPath = path.resolve(".", process.env.CONTENT_PATH || "content/");

for await (const filePath of (await glob(
    "/src/**/*.md",
    {
        cwd: contentAbsPath,
        root: contentAbsPath,
        dot: false,
        ignore: [
            "src/Templates/**",
            "src/attachments/**"
        ]
    }
))) {
    const data = matter.read(filePath, {
        engines: {
            yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA })
        }
    });
    console.log(`Import ${path.relative(contentAbsPath, filePath)}`);
    if (
        (data.data.draft === true) ||
        (data.data.draft === "true")
    ) {
        console.log("Skip draft note");
        continue;
    }

    const [WikiLinks, Tags] = extractLinksAndTags(data.content);
    data.data.tags = [...new Set([...data.data?.tags || [], ...Tags])];

    const fileName = path.parse(path.basename(filePath)).name;

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
    const fileNameIndex = allNoteFileNames.findIndex((item) => item === fileName);
    if (fileNameIndex > -1) {
        allNoteFileNames.splice(fileNameIndex, 1);
    }
}

// Delete all notes that no longer exist
for (const fileName of allNoteFileNames) {
    console.log(`Delete "${fileName}" note still in Elastic Search database`);
    await client.delete({
      index: "notes",
      id: fileName
    });
}
