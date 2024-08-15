export async function load({locals}) {
    return {
        tags: (
            await locals.sql`
                SELECT
                    name,
                    note_counts
                FROM
                    public.note_tags
                ORDER BY note_counts DESC
            `
        )
    };
}
