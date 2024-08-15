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

export default async function search({
    sql = null,
    tagName = null,
    createdAfter = null,
    createdBefore = null,
    notesByPage = 50
} = {}) {

    // I think the following query is very optimized, but I also think it's hard to read.
    // I apologize for that.
    // I'd like to take the time one day to try and refactor it to make it more readable.
    let result = (await sql`
        WITH _tag_id AS (
            SELECT
                id
            FROM
                public.note_tags
            WHERE
                name=${tagName}
        ),
        _count_notes AS (
            SELECT
                COUNT(id) AS count
            FROM
                public.notes_with_tag_names
            WHERE
                (note_type='fleeting_note') AND
                (
                    ((SELECT COUNT(*) FROM _tag_id) = 0) OR
                    ((SELECT id FROM _tag_id) = ANY(tags))
                )
        ),
        _notes AS (
            SELECT
                nanoid,
                filename,
                content,
                created_at,
                tag_names
            FROM
                public.notes_with_tag_names
            WHERE
                (note_type='fleeting_note') AND
                (
                    ((SELECT COUNT(*) FROM _tag_id) = 0) OR
                    ((SELECT id FROM _tag_id) = ANY(tags))
                )
                ${
                    (createdAfter !== null)
                        ? sql` AND (created_at > TO_TIMESTAMP(${ createdAfter }, 'YYYYMMDDHH24MISS'))`
                        : (
                            (createdBefore !== null)
                                ? sql` AND (created_at < TO_TIMESTAMP(${ createdBefore }, 'YYYYMMDDHH24MISS'))`
                                : sql``
                        )
                }
            ORDER BY created_at 
                ${
                    (createdAfter !== null)
                    ? sql`ASC`
                    : sql`DESC`
                }
            LIMIT ${notesByPage}
        ),
        _count_new_notes AS (
            SELECT
                (
                    COUNT(id)
                    ${
                        ((createdAfter !== null) && (createdBefore === null))
                            ? sql`- (SELECT COUNT(*) FROM _notes)`
                            : sql``
                    }
                ) AS count
            FROM
                public.notes
            WHERE
                (note_type='fleeting_note') AND
                (
                    ((SELECT COUNT(*) FROM _tag_id) = 0) OR
                    ((SELECT id FROM _tag_id) = ANY(tags))
                )
                ${
                    (createdAfter !== null)
                        ? sql` AND (created_at > TO_TIMESTAMP(${ createdAfter }, 'YYYYMMDDHH24MISS'))`
                        : (
                            (createdBefore !== null)
                                ? sql` AND (created_at >= TO_TIMESTAMP(${ createdBefore }, 'YYYYMMDDHH24MISS'))`
                                : sql` AND created_at IS NULL`
                        )
                }
        ),
        _count_old_notes AS (
            SELECT
                (
                    COUNT(id)
                    ${
                        ((createdBefore !== null) && (createdAfter === null))
                            ? sql`- (SELECT COUNT(*) FROM _notes)`
                            : sql``
                    }
                ) AS count
            FROM
                public.notes
            WHERE
                (note_type='fleeting_note') AND
                (
                    ((SELECT COUNT(*) FROM _tag_id) = 0) OR
                    ((SELECT id FROM _tag_id) = ANY(tags))
                )
                ${
                    (createdBefore !== null)
                        ? sql` AND (created_at < TO_TIMESTAMP(${ createdBefore }, 'YYYYMMDDHH24MISS'))`
                        : (
                            (createdAfter !== null)
                                ? sql` AND (created_at <= TO_TIMESTAMP(${ createdAfter }, 'YYYYMMDDHH24MISS'))`
                                : sql``
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
                'count_notes',
                (SELECT count FROM _count_notes),
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

    if (createdAfter !== null) {
        result.notes = result.notes.reverse();
    }

    return {
        countNotes: result.count_notes,
        countNewNotes: result.count_new_notes,
        countOldNotes: result.count_old_notes,
        firstNote:result.notes[0], 
        lastNote: result.notes.at(-1),
        notesByDay: groupByDay(result.notes)
    };
}
