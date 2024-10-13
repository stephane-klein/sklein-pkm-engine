#!/usr/bin/env node
import { glob } from "glob";
import path from "path";
import fs from "fs";
import { customAlphabet } from "nanoid/non-secure";
import matter from "gray-matter";
import yaml from "js-yaml";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12); // see https://notes.sklein.xyz/Notes-%C3%A9ph%C3%A9m%C3%A8res/2024-07-19_2316

const contentAbsPath = path.resolve(".", process.env.CONTENT_PATH || "content/");

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
    if (data.data?.nanoid) {
        console.log(`Skip ${filePath}`);
    } else {
        console.log(`Inject in ${filePath}`);
        data.data.nanoid = nanoid();

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
