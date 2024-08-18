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
    node: "http://localhost:9200",
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
                analyzer: "french_analyzer"
            },
            linked_notes: "keyword",
            tags: "keyword",
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
});

process.chdir(__dirname);

for await (const filePath of (await glob("content/**/*.md"))) {
    const data = matter.read(filePath, {
        engines: {
            yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA })
        }
    });
    console.log(`Import ${filePath}`);

    const [WikiLinks, Tags] = extractLinksAndTags(data.content);
    data.data.tags = [...new Set([...data.data?.tags || [], ...Tags])];

    const fileName = path.parse(path.basename(filePath)).name;

    await client.index({
        index: "notes",
        id: fileName,
        document: {
            title: data.data?.title || path.basename(fileName, path.extname(fileName)),
            linked_notes: WikiLinks,
            tags: data.data?.tags || [],
            content: data.content,
            content_html: md.render(data.content)
        },
    });
}
