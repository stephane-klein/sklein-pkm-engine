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

const notesByPage = 10;

export async function load({locals, url}) {
    let notes = (await locals.sql`
        SELECT
            nanoid,
            filename,
            content,
            created_at
        FROM
            public.notes
        WHERE
            note_type='fleeting_note' 
            ${
                (url.searchParams.get("created_after") !== null)
                    ? locals.sql` AND (created_at > TO_TIMESTAMP(${ url.searchParams.get("created_after") }, 'YYYYMMDDHH24MISS'))`
                    : (
                        (url.searchParams.get("created_before") !== null)
                            ? locals.sql` AND (created_at < TO_TIMESTAMP(${ url.searchParams.get("created_before") }, 'YYYYMMDDHH24MISS'))`
                            : locals.sql``
                    )
            }
        ORDER BY created_at 
            ${
                (url.searchParams.get("created_after") !== null)
                ? locals.sql`ASC`
                : locals.sql`DESC`
            }
        LIMIT ${notesByPage}
    `).map((note) => {
        return {
            html: md.render(note.content),
            ...note
        };
    });

    if (url.searchParams.get("created_after") !== null) {
        notes = notes.reverse();
    }

    return {
        firstNote:notes[0], 
        lastNote: notes.at(-1),
        notesByDay: groupByDay(notes)
    }
}
