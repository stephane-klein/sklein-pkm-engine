import search from "./search.js";

export async function load({url}) {
    return {
        tags: [],
        ...(await search({
            createdAfter: url.searchParams.get("created_after"),
            createdBefore: url.searchParams.get("created_before"),
            tagName: url.searchParams.get("tags"),
            returnTags: true
        }))
    };
}
