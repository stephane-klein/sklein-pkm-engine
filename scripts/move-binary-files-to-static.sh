#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

find "content/src/" -type f ! -name "*.md" -exec mv {} "static/" \;
