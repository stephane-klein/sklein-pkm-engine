#!/usr/bin/env node
import { glob } from "glob";
import path from "path";
import postgres from "postgres";
import matter from "gray-matter";
import yaml from "js-yaml";

const sql = postgres(
    process.env.POSTGRES_ADMIN_URL || "postgres://postgres:password@localhost:5432/postgres",
    {
        connection: {
            search_path: "ag_catalog"
        }
    }
);

await sql.unsafe(`
    DELETE FROM public.notes CASCADE;
`);

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
            filename,
            note_type,
            content,
            created_at
        )
        VALUES(
            ${data.data.nanoid},
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
                content=${data.content},
                note_type=${data.data?.type || null},
                created_at=${
                    (data.data.created_at && (data.data.type === "fleeting_note")) ? data.data.created_at + ":00" : null
                }
        RETURNING id
    `;
}

sql.end();
