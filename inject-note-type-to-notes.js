#!/usr/bin/env node
import { glob } from "glob";
import path from "path";
import fs from "fs";
import matter from "gray-matter";
import yaml from "js-yaml";

const contentAbsPath = path.resolve(".", process.env.CONTENT_PATH || "content/");

for (const filePath of (await glob(
    "/src/Notes éphémères/*.md",
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

    console.log(`Inject type:journal_note in ${filePath}`);
    if (data.data?.type !== "journal_note") {
        data.data.type = "journal_note";

        const newContent = matter.stringify(data.content, data.data, {
            language: 'yaml', // Spécifie que nous utilisons YAML
            engines: {
                yaml: {
                    parse: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }),
                    stringify: (d) => yaml.dump(d, { schema: yaml.JSON_SCHEMA })
                }
            }
        });
        fs.writeFileSync(filePath, newContent, "utf8");
    }
}

for (const filePath of (await glob(
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
    if (data.data?.type) {
        console.log(`Skip ${filePath}`);
    } else {
        console.log(`Inject type:evergreen_note in ${filePath}`);
        data.data.type = "evergreen_note";

        const newContent = matter.stringify(data.content, data.data, {
            language: 'yaml', // Spécifie que nous utilisons YAML
            engines: {
                yaml: {
                    parse: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }),
                    stringify: (d) => yaml.dump(d, { schema: yaml.JSON_SCHEMA })
                }
            }
        });
        fs.writeFileSync(filePath, newContent, "utf8");
    }
}
