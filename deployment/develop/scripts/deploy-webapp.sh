#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

./scripts/docker-build-webapp-develop.sh
./scripts/docker-push-webapp-develop.sh

./scripts/deploy.sh --no-upload
