#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

if [[ "$1" != '--no-upload' ]]; then
    ./scripts/docker-push-postgres-develop.sh
    ./scripts/docker-push-nginx-develop.sh
    ./scripts/docker-push-webapp-develop.sh
fi

gomplate -f _deploy.sh | ssh triton 'bash -s'

echo "Application deployed"
