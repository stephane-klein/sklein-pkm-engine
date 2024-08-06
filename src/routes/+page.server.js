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

const notesByPage = 50;

export async function load({locals, url}) {
    const createdAfter = url.searchParams.get("created_after");
    const createdBefore = url.searchParams.get("created_before");
    // I think the following query is very optimized, but I also think it's hard to read.
    // I apologize for that.
    // I'd like to take the time one day to try and refactor it to make it more readable.
    let result = (await locals.sql`
        WITH _notes AS (
            SELECT
                nanoid,
                filename,
                content,
                created_at,
                tag_names
            FROM
                public.notes_with_tag_names
            WHERE
                note_type='fleeting_note' 
                ${
                    (url.searchParams.get("created_after") !== null)
                        ? locals.sql` AND (created_at > TO_TIMESTAMP(${ createdAfter }, 'YYYYMMDDHH24MISS'))`
                        : (
                            (createdBefore !== null)
                                ? locals.sql` AND (created_at < TO_TIMESTAMP(${ createdBefore }, 'YYYYMMDDHH24MISS'))`
                                : locals.sql``
                        )
                }
            ORDER BY created_at 
                ${
                    (createdAfter !== null)
                    ? locals.sql`ASC`
                    : locals.sql`DESC`
                }
            LIMIT ${notesByPage}
        ),
        _count_new_notes AS (
            SELECT
                (
                    COUNT(id)
                    ${
                        ((createdAfter !== null) && (createdBefore === null))
                            ? locals.sql`- (SELECT COUNT(*) FROM _notes)`
                            : locals.sql``
                    }
                ) AS count
            FROM
                public.notes
            WHERE
                note_type='fleeting_note' 
                ${
                    (createdAfter !== null)
                        ? locals.sql` AND (created_at > TO_TIMESTAMP(${ createdAfter }, 'YYYYMMDDHH24MISS'))`
                        : (
                            (createdBefore !== null)
                                ? locals.sql` AND (created_at >= TO_TIMESTAMP(${ createdBefore }, 'YYYYMMDDHH24MISS'))`
                                : locals.sql` AND created_at IS NULL`
                        )
                }
        ),
        _count_old_notes AS (
            SELECT
                (
                    COUNT(id)
                    ${
                        ((createdBefore !== null) && (createdAfter === null))
                            ? locals.sql`- (SELECT COUNT(*) FROM _notes)`
                            : locals.sql``
                    }
                ) AS count
            FROM
                public.notes
            WHERE
                note_type='fleeting_note' 
                ${
                    (createdBefore !== null)
                        ? locals.sql` AND (created_at < TO_TIMESTAMP(${ createdBefore }, 'YYYYMMDDHH24MISS'))`
                        : (
                            (createdAfter !== null)
                                ? locals.sql` AND (created_at <= TO_TIMESTAMP(${ createdAfter }, 'YYYYMMDDHH24MISS'))`
                                : locals.sql``
                        )
                }
        )
        SELECT
            JSONB_BUILD_OBJECT(
                'notes',
                (
                    SELECT
                        COALESCE(
                            ARRAY_AGG(ROW_TO_JSON(_notes)),
                            ARRAY[]::JSON[]
                        )
                    FROM
                        _notes
                ),
                'count_new_notes',
                (SELECT count FROM _count_new_notes),
                'count_old_notes',
                (SELECT count FROM _count_old_notes)
            ) AS result
    `)[0].result;

    result.notes = result.notes.map((note) => {
        return {
            html: md.render(note.content),
            ...note
        };
    });

    if (url.searchParams.get("created_after") !== null) {
        result.notes = result.notes.reverse();
    }

    return {
        countNewNotes: result.count_new_notes,
        countOldNotes: result.count_old_notes,
        firstNote:result.notes[0], 
        lastNote: result.notes.at(-1),
        notesByDay: groupByDay(result.notes)
    }
}
