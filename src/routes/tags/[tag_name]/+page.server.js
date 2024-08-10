import md from "$lib/server/markdown.js";

export async function load({locals, params}) {
    let notes = (await locals.sql`
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
            (SELECT id FROM public.note_tags WHERE name=${params.tag_name}) = ANY(tags);
    `);
    notes = notes.map((note) => {
        return {
            html: md.render(note.content),
            ...note
        };
    });

    return {
        tag_name: params.tag_name,
        notes: notes
    };
}
