#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

./scripts/docker-build-webapp-prod.sh
./scripts/docker-push-webapp-prod.sh

./scripts/deploy.sh --no-upload
