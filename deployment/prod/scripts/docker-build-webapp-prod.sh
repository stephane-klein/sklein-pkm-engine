#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../../../"

cat <<EOF > static/version.json
{
    "environment": "prod",
    "branch": "$(git rev-parse --abbrev-ref HEAD)",
    "gitDate": "$(git show -s --format=%ci | sed "s/ /_/g")",
    "buildStamp": "$(env TZ=Europe/Paris date '+%Y-%m-%d_%H:%M:%S-%Z')",
    "gitHash": "$(git rev-parse HEAD)"
}
EOF

docker build . -t sklein-pkm-engine-webapp:prod

rm static/version.json
