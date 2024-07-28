#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../../../postgres/"

docker build . -t sklein-pkm-engine-postgres:develop
