import search from "./search/search.js";

export async function load({locals, url}) {
    return (await search({
        sql: locals.sql,
        createdAfter: url.searchParams.get("created_after"),
        createdBefore: url.searchParams.get("created_before")
    }));
}
