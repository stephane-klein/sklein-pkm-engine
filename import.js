#!/usr/bin/env node
import { fileURLToPath } from "url";
import path from "path";
import { glob } from "glob";
import postgres from "postgres";
import matter from "gray-matter";
import yaml from "js-yaml";
import { extractLinksAndTags } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = postgres(
    process.env.POSTGRES_URL || "postgres://postgres:password@localhost:5432/postgres",
    {
        connection: {
            search_path: "ag_catalog"
        }
    }
);

await sql.unsafe(`
    DELETE FROM public.notes CASCADE;
    SELECT drop_graph('graph', true);
    SELECT create_graph('graph');
`);

process.chdir(__dirname);

for await (const filePath of (await glob("content/**/*.md"))) {
    const data = matter.read(filePath, {
        engines: {
            yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA })
        }
    });
    console.log(`Import ${filePath}`);

    const fileName = path.parse(path.basename(filePath)).name;
    await sql`
        INSERT INTO public.notes
        (
            nanoid,
            title,
            filename,
            note_type,
            content,
            created_at
        )
        VALUES(
            ${data.data.nanoid},
            ${data.data?.title || path.parse(fileName).name},
            ${fileName},
            ${data.data?.type || null},
            ${data.content},
            ${
                (data.data.created_at && (data.data.type === "fleeting_note")) ? data.data.created_at + ":00" : null
            }
        )
        ON CONFLICT (filename) DO UPDATE
            SET
                nanoid=${data.data.nanoid},
                title=${data.data?.title || path.parse(fileName).name},
                content=${data.content},
                note_type=${data.data?.type || null},
                created_at=${
                    (data.data.created_at && (data.data.type === "fleeting_note")) ? data.data.created_at + ":00" : null
                }
        RETURNING id
    `;

    await sql.unsafe(`
        SELECT *
        FROM cypher('graph', $$
            MERGE (
                n:Note {
                    file_name: '${fileName.replace(/'/g, "\\'")}',
                    title: '${(data.data?.title || path.parse(fileName).name).replace(/'/g, "\\'") }'
                }
            )
            SET
                n.file_path='${filePath.replace(/'/g, "\\'")}'
        $$) AS (v agtype);
    `);

    const [WikiLinks, Tags] = extractLinksAndTags(data.content);
    data.data.tags = [...new Set([...data.data?.tags || [], ...Tags])]

    if (data.data.tags) {
        for await (const tagName of data.data.tags) {
            await sql.unsafe(`
                SELECT *
                FROM cypher('graph', $$
                    MATCH
                        (n:Note)
                    WHERE
                        n.file_path = '${filePath.replace(/'/g, "\\'")}'

                    MERGE (
                        t:Tag
                        {
                            name: '${tagName.replace(/'/g, "\\'")}'
                        }
                    )

                    CREATE
                        (n)-[:LABELED_BY]->(t)
                $$) AS (v agtype)
            `);
        };
    }

    for await (const WikiLink of WikiLinks) {
        await sql.unsafe(`
            SELECT *
            FROM cypher('graph', $$
                MATCH
                    (n1:Note)
                WHERE
                    n1.file_path = '${filePath.replace(/'/g, "\\'")}'

                MERGE (
                    n2:Note {
                        file_name: '${WikiLink.replace(/'/g, "\\'")}',
                        title: '${WikiLink.replace(/'/g, "\\'")}'
                    }
                )

                CREATE
                    (n1)-[:LINKED_TO]->(n2)
            $$) AS (v agtype);
        `);
    }
}

sql.end();
