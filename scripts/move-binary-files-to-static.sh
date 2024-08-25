#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

rm -rf static
mkdir static
find "${CONTENT_PATH:-'content'}/src/" -type f ! -name "*.md" -exec mv {} "static/" \;
