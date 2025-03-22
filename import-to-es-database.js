#!/usr/bin/env node
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { glob } from "glob";
import { Client } from "@elastic/elasticsearch";
import matter from "gray-matter";
import yaml from "js-yaml";
import { Listr } from "listr2";
import { program } from "commander";
import { extractLinksAndTags } from "./utils.js";
import md from "./src/lib/server/markdown.js";
import { parse, format } from "date-fns";
import { customAlphabet } from "nanoid/non-secure";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.chdir(__dirname);

program
    .option('--dry', 'Run in dry mode')
    .option('--ignore-state', 'Ignore state file')
    .parse();

const client = new Client({
    node: process.env.ELASTICSEARCH_URL || "http://localhost:9200"
});

const options = program.opts();

let ctx = {
    ...options,
    lastImportDatetime: (
        (fs.existsSync("import-to-es-database.state") && !options.ignoreState)
            ? parse(fs.readFileSync("import-to-es-database.state", "utf8"), "yyyyMMddHHmmss", new Date())
            : null
    ),
    currentDatetime: undefined,
    notesIndiceExists: false,
    contentAbsPath: path.resolve(".", process.env.CONTENT_PATH || "content/"),
    allFilenameOfNotesInElasticsearch: [],
    allFilepathOfNotesOnTheFileSystem: [],
    filepathOfNotesOnTheFileSystemUpdatedSinceLastimport: null
};

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12); // see https://notes.sklein.xyz/Notes-%C3%A9ph%C3%A9m%C3%A8res/2024-07-19_2316

const tasks = new Listr(
    [
        {
            title: `Inject nanoid and type props to note front-matters`,
            task: async(ctx, task) => {
                const contentAbsPathLength = ctx.contentAbsPath.length;

                for (const filePath of (await glob(
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
                ))) {
                    const relativeFilePath = filePath.substring(contentAbsPathLength);
                    const data = matter.read(filePath, {
                        engines: {
                            yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA })
                        }
                    });
                    let frontMatterUpdated = false;
                    if (!data.data?.nanoid) {
                        data.data.nanoid = nanoid();
                        frontMatterUpdated = true;
                        task.output = `Inject nanoid: ${data.data.nanoid} to ${relativeFilePath} note`;
                    }
                    if (relativeFilePath.startsWith("/src/Notes éphémères/")) {
                        if (data.data?.type !== "journal_note") {
                            data.data.type = "journal_note";
                            frontMatterUpdated = true;
                            task.output = `Inject type: "journal_note" to ${relativeFilePath} note`;
                        }
                    } else if (relativeFilePath.startsWith("/src/unlisted/")) {
                        data.data.type = "unlisted";
                        frontMatterUpdated = true;
                        task.output = `Inject type: "unlisted" to ${relativeFilePath} note`;
                    } else {
                        if (!data.data?.type) {
                            data.data.type = "evergreen_note";
                            frontMatterUpdated = true;
                            task.output = `Inject type: "evergreen_note" to ${relativeFilePath} note`;
                        }
                    }

                    if (relativeFilePath.startsWith("/src/Notes éphémères/")) {
                        if (!data.data?.created_at) {
                            const filename = path.parse(path.basename(filePath)).name;
                            if (filename.length === 10) {
                                data.data.created_at = `${filename} 20:00`; // The choice of 20:00 is arbitrary.
                                task.output = `Inject created_at: "${data.data.created_at}" to ${relativeFilePath} note`;
                                frontMatterUpdated = true;
                            } else if (filename.length === 15) {
                                data.data.created_at = `${filename.substring(0, 10)} ${filename.substring(11, 13)}:${filename.substring(13, 15)}`;
                                task.output = `Inject created_at: "${data.data.created_at}" to ${relativeFilePath} note`;
                                frontMatterUpdated = true;
                            }
                        }
                    }

                    if (frontMatterUpdated) {
                        const newContent = matter.stringify(data.content, data.data, {
                            language: 'yaml',
                            engines: {
                                yaml: {
                                    parse: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }),
                                    stringify: (d) => yaml.dump(d, { schema: yaml.JSON_SCHEMA })
                                }
                            }
                        });
                        if (!ctx.dry) {
                            fs.writeFileSync(filePath, newContent, "utf8");
                        }
                    }
                }
                ctx.currentDatetime = format(new Date(new Date().getTime() + 1000), "yyyyMMddHHmmss");
            },
            rendererOptions: {
                outputBar: 20,
                persistentOutput: true
            }
        },
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
            task: async(ctx) => {
                // If you modify this data model, you must delete the database with the following script:
                //
                // $ ./reset-es-database.js
                //
                if (!ctx.dry) {
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
            title: `Loads a list of all notes on the file system`,
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
            title: (
                ctx.lastImportDatetime
                    ? `Generates the list of notes to be imported, the note updated after ${format(ctx.lastImportDatetime, "yyyy-MM-dd HH:mm:SS")}`
                    : `Generates the list of notes to be imported`
            ),
            enabled: (ctx) => ctx.lastImportDatetime !== null,
            task: async(ctx, task) => {
                let index = 0;
                let totalNoteToImport = 0;
                const allNoteFilesLength = ctx.allFilepathOfNotesOnTheFileSystem.length;
                ctx.filepathOfNotesOnTheFileSystemUpdatedSinceLastimport = ctx.allFilepathOfNotesOnTheFileSystem.filter((filePath) => {
                    index++;
                    task.title = `Generates the list of notes to be imported, the note updated after ${format(ctx.lastImportDatetime, "yyyy-MM-dd HH:mm:SS")} (${index}/${allNoteFilesLength}) => ${totalNoteToImport}`;
                    const isUpdatedFile = fs.statSync(filePath).mtime > ctx.lastImportDatetime;
                    if (isUpdatedFile) {
                        const data = matter.read(filePath, {
                            engines: {
                                yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA })
                            }
                        });
                        if (
                            (data.data.draft !== true) &&
                            (data.data.draft !== "true")
                        ) {
                            task.output = `Add note: ${path.parse(path.basename(filePath)).name}`;
                            totalNoteToImport++;

                            return true;
                        }
                    }
                    return false;
                });
            },
            rendererOptions: {
                outputBar: 20,
                persistentOutput: true
            }
        },
        {
            title: "Upload notes from filesystem to Elasticsearch database",
            task: async(ctx, task) => {
                let index = 0;
                const contentAbsPathLength = ctx.contentAbsPath.length;
                const filepathOfNoteToUpload = (
                    ctx.filepathOfNotesOnTheFileSystemUpdatedSinceLastimport
                        ? ctx.filepathOfNotesOnTheFileSystemUpdatedSinceLastimport
                        : ctx.allFilepathOfNotesOnTheFileSystem
                );
                for await (const filePath of filepathOfNoteToUpload) {
                    index++;
                    task.title = `Upload notes from filesystem to Elasticsearch database (${index}/${filepathOfNoteToUpload.length})`;
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
                        task.output = `Upload ${relativeFilePath} to Elasticsearch database`;
                    }

                    const [WikiLinks, Tags] = extractLinksAndTags(data.content);
                    data.data.tags = [...new Set([...data.data?.tags || [], ...Tags])];

                    if (!ctx.dry) {
                        await client.index({
                            index: "notes",
                            id: fileName,
                            document: {
                                filename: fileName,
                                created_at: (data.data.created_at && (data.data.type === "journal_note")) ? data.data.created_at + ":00" : null,
                                title: data.data?.title || ((data.data.type === "evergreen_note") ? path.parse(fileName).name : undefined),
                                note_type: data.data?.type || null,
                                linked_notes: WikiLinks,
                                tags: data.data?.tags || [],
                                content: data.content,
                                content_html: md.render(data.content)
                            },
                        });
                    }
                }
            },
            rendererOptions: {
                outputBar: 20,
                persistentOutput: true
            }
        },
        {
            title: "Delete any notes still present in the Elasticsearch database but which have been deleted from the filesystem",
            task: async(ctx, task) => {
                let index = 0;

                const notesToDelete = ctx.allFilenameOfNotesInElasticsearch.filter(
                    (noteFileName) => {
                        return (
                            !ctx.allFilepathOfNotesOnTheFileSystem.some(
                                (noteFilepath) => {
                                    return path.parse(path.basename(noteFilepath)).name === noteFileName;
                                }
                            )
                        );
                    }
                );
                const notesToDeleteLength = notesToDelete.length;

                task.title = `Delete any notes still present in the Elasticseach database but which have been deleted from the filesystem (${index}/${notesToDeleteLength})`;
                for (const fileName of notesToDelete) {
                    index++;
                    task.title = `Delete any notes still present in the Elasticsearch database but which have been deleted from the filesystem (${index}/${notesToDeleteLength})`;
                    task.output = `Delete "${fileName}" note from Elasticsearch database`;
                    if (!ctx.dry) {
                        await client.delete({
                           index: "notes",
                           id: fileName
                        });
                    }
                }
            }
        },
        {
            title: `Write current datetime ${ctx.currentDatetime} to import-to-es-database.state`,
            enabled: (ctx) => !ctx.ignoreState,
            task: async(ctx) => {
                if (!ctx.dry) {
                    fs.writeFileSync("import-to-es-database.state", ctx.currentDatetime);
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
