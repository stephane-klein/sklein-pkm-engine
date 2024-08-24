import esClient from "$lib/server/elasticsearch.js";
import search from "./search/search.js";

export async function load({url}) {
    if (!await esClient.indices.exists({ index: "notes" })) {
        return {
            databaseNotConfigured: true
        };
    }
    return search({
        createdAfter: url.searchParams.get("created_after"),
        createdBefore: url.searchParams.get("created_before")
    });
}
