import md from "$lib/server/markdown.js";
import { format } from "date-fns";

function groupByDay(notes) {
    return notes.reduce((acc, note) => {
        let date = format(note.created_at, "yyyy-MM-dd");
        //let date = note.created_at.toISOString().split('T')[0];

        if (!acc[date]) {
            acc[date] = [];
        }

        acc[date].push(note);

        return acc;
    }, {});
}

export async function load({locals}) {
    const notes = (await locals.sql`
        SELECT
            nanoid,
            filename,
            content,
            created_at
        FROM
            public.notes
        WHERE
            note_type='fleeting_note'
        ORDER BY created_at DESC
    `).map((note) => {
        return {
            html: md.render(note.content),
            ...note
        };
    });

    return {
        notesByDay: groupByDay(notes)
    }
}
