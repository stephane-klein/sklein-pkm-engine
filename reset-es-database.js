#!/usr/bin/env node
import { Client } from "@elastic/elasticsearch";

const client = new Client({
    node: process.env.ELASTICSEARCH_URL || "http://localhost:9200"
});

await client.indices.delete({ index: "notes", ignore_unavailable: true });
