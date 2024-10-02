#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../../../"

docker build . -t sklein-pkm-engine-webapp:prod
