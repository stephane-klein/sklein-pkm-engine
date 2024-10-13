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
    if (data.data?.created_at) {
        console.log(`Skip ${filePath}`);
    } else {
        const filename = path.parse(path.basename(filePath)).name;

        if (filename.length === 10) {
            data.data.created_at = `${filename} 20:00`; // The choice of 20:00 is arbitrary.
        } else if (filename.length === 15) {
            data.data.created_at = `${filename.substr(0, 10)} ${filename.substr(11, 2)}:${filename.substr(13, 2)}`;
        } else {
            console.log(`Skip ${filePath}, file name cannot be converted to datetime`);
            continue;
        }

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
