import esClient from "$lib/server/elasticsearch.js";

export async function load() {
    const tagsResult = await esClient.search({
        index: "notes",
        body: {
            size: 0,
            aggs: {
                tags_count: {
                    terms: {
                        field: "tags",
                        size: 100000
                    }
                }
            }
        }
    });

    return {
        tags: tagsResult.aggregations.tags_count.buckets
    };
}
