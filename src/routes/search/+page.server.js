import search from "./search.js";

export async function load({locals, url}) {
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
        ),
        ...(await search({
            sql: locals.sql,
            createdAfter: url.searchParams.get("created_after"),
            createdBefore: url.searchParams.get("created_before"),
            tagName: url.searchParams.get("tags")
        }))
    };
}
