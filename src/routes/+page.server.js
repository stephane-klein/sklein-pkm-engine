import search from "./search/search.js";

export async function load({url}) {
    return search({
        createdAfter: url.searchParams.get("created_after"),
        createdBefore: url.searchParams.get("created_before")
    });
}
