import md from "$lib/server/markdown.js";

export async function load({locals, params}) {
    const note = (await locals.sql`
        SELECT
            nanoid,
            content,
            created_at
        FROM
            public.notes
        WHERE
            filename=${params.note_filename}
    `)[0];

    note.html = md.render(note.content);

    return note;
}
