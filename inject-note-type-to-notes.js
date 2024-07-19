#!/usr/bin/env node
import { glob } from "glob";
import fs from "fs";
import matter from "gray-matter";
import yaml from "js-yaml";

for await (const filePath of (await glob("content/src/Notes éphémères/*.md"))) {
    const data = matter.read(filePath, {
        engines: {
            yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA })
        }
    });
    if (data.data?.type) {
        console.log(`Skip ${filePath}`);
    } else {
        console.log(`Inject type:fleeting_note in ${filePath}`);
        data.data.type = "fleeting_note";

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

for await (const filePath of (await glob("content/src/**/*.md"))) {
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
