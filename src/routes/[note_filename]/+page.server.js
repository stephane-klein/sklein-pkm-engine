import { error } from '@sveltejs/kit';
import md from "$lib/server/markdown.js";

export async function load({locals, params}) {
    const data = (await locals.sql`
        WITH _note AS (
            SELECT
                nanoid,
                content,
                title,
                created_at,
                note_type,
                tag_names
            FROM
                public.notes_with_tag_names
            WHERE
                filename=${params.note_filename}
        ),
        _backlinks_file_names AS (
            SELECT file_name
            FROM 
                ag_catalog.cypher('graph', $$
                    MATCH (note:Note)-[:LINKED_TO]->(note2:Note {file_name: "${locals.sql.unsafe(params.note_filename)}"})
                    RETURN note.file_name
                $$) AS (file_name ag_catalog.agtype)
        ),
        _backlinks_notes AS (
            SELECT
                notes.nanoid,
                notes.filename,
                notes.content,
                notes.created_at,
                notes.note_type
            FROM
                _backlinks_file_names
            LEFT JOIN
                public.notes
            ON
                notes.filename=TRIM(BOTH '"' FROM _backlinks_file_names.file_name::VARCHAR)
            WHERE
                notes.note_type = 'fleeting_note'
            ORDER BY notes.created_at DESC
        )
        SELECT
            JSONB_BUILD_OBJECT(
                'note',
                (SELECT ROW_TO_JSON(_note) FROM _note),
                'backlink_notes',
                (
                    SELECT
                        COALESCE(
                            ARRAY_AGG(ROW_TO_JSON(_backlinks_notes)),
                            ARRAY[]::JSON[]
                        )
                    FROM
                        _backlinks_notes
                )
            ) AS data
    `)[0].data;
    if (data.note) {
        data.note.html = md.render(data.note.content);
        data.backlink_notes = data.backlink_notes.map((note) => {
            return {
                html: md.render(note?.content || ""),
                ...note
            };
        });
    } else {
        error(404, 'Not Found');
    }

    return data;
}
