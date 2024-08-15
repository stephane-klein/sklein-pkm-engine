import search from "./search.js";

export async function load({url}) {
    return {
        tags: [],
        ...(await search({
            createdAfter: url.searchParams.get("created_after"),
            createdBefore: url.searchParams.get("created_before"),
            tags: url.searchParams.getAll("tags"),
            queryString: decodeURIComponent((url.searchParams.get("q") || "").trim()),
            returnTags: true
        }))
    };
}
