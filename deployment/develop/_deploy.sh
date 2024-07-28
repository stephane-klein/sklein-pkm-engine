#!/usr/bin/env bash
set -e

PROJECT_FOLDER="/srv/notes.develop.sklein.xyz/"

mkdir -p ${PROJECT_FOLDER}

cat <<EOF > ${PROJECT_FOLDER}docker-compose.yaml
services:
    postgres:
        image: sklein-pkm-engine-postgres:develop
        restart: unless-stopped
        ports:
            - 127.0.0.1:{{ .Env.INSTANCE_DEVELOP_POSTGRES_PORT }}:5432
        environment:
            POSTGRES_DB: postgres
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: {{ .Env.POSTGRES_PASSWORD }}
        volumes:
            - /var/lib/notes.develop.sklein.xyz/postgres/:/var/lib/postgresql/data/
        healthcheck:
            test: ["CMD", "pg_isready"]
            interval: 10s
            start_period: 30s

    nginx:
        image: sklein-pkm-engine-nginx:develop
        restart: unless-stopped
        environment:
            VIRTUAL_HOST: notes.develop.sklein.xyz
            VIRTUAL_PORT: 80
            LETSENCRYPT_HOST: notes.develop.sklein.xyz
            LETSENCRYPT_EMAIL: contact@stephane-klein.info
        volumes:
            - /var/lib/notes.develop.sklein.xyz/static/:/usr/share/nginx/html/
        depends_on:
            - webapp

    webapp:
        image: sklein-pkm-engine-webapp:develop
        environment:
            POSTGRES_URL: "postgres://postgres:{{ .Env.POSTGRES_PASSWORD }}@postgres:5432/postgres"
        depends_on:
            - postgres
EOF

cd ${PROJECT_FOLDER}

docker compose up -d --wait

