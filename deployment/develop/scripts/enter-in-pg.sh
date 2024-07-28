#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

if [ "$#" -eq 0 ]; then
    psql "${POSTGRES_URL}"
else
    psql "${POSTGRES_URL}" -f $@
fi
