#!/usr/bin/env bash
set -e

PROJECT_FOLDER="/srv/notes.sklein.xyz/"

mkdir -p ${PROJECT_FOLDER}
mkdir -p /var/lib/notes.sklein.xyz/elasticsearch/
chmod ugo+rwX /var/lib/notes.sklein.xyz/elasticsearch/

cat <<EOF > ${PROJECT_FOLDER}docker-compose.yaml
services:
    elasticsearch:
        image: elasticsearch:8.15.2
        ports:
            - 127.0.0.1:{{ .Env.INSTANCE_PROD_ELASTICSEARCH_PORT }}:9200
        environment:
            - discovery.type=single-node
            - cluster.name=docker-cluster
            - node.name=node-1
            - network.host=0.0.0.0
            - http.port=9200
            - logger.level=warn
            - cluster.routing.allocation.disk.threshold_enabled=false
            - cluster.routing.allocation.disk.watermark.high=99%
            - cluster.routing.allocation.disk.watermark.low=99%
            - cluster.routing.allocation.disk.watermark.flood_stage=99%
            - xpack.security.enabled=false
            - http.cors.enabled=true
            - http.cors.allow-origin="http://localhost:8080"
        deploy:
            resources:
                limits:
                    memory: 1GB
        volumes:
            - /var/lib/notes.sklein.xyz/elasticsearch/:/usr/share/elasticsearch/data
        healthcheck:
            test:
                [
                    "CMD-SHELL",
                    "curl -s -X GET http://localhost:9200/_cluster/health?pretty | grep status | grep -q '\\\\(green\\\\|yellow\\\\)'"
                ]
            interval: 10s
            timeout: 10s
            retries: 24

    nginx:
        image: sklein-pkm-engine-nginx:prod
        restart: unless-stopped
        environment:
            VIRTUAL_HOST: notes.sklein.xyz
            VIRTUAL_PORT: 80
            LETSENCRYPT_HOST: notes.sklein.xyz
            LETSENCRYPT_EMAIL: contact@stephane-klein.info
        volumes:
            - /var/lib/notes.sklein.xyz/static/:/usr/share/nginx/html/
        depends_on:
            - webapp

    webapp:
        image: sklein-pkm-engine-webapp:prod
        environment:
            ELASTICSEARCH_URL: "http://elasticsearch:9200"
        depends_on:
            - elasticsearch
EOF

cd ${PROJECT_FOLDER}

docker compose up -d --wait

