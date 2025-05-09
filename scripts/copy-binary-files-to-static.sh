#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

rm -rf static
mkdir static
find "${CONTENT_PATH:-'content'}/src/" -type f \( -name "*.jpeg" -o -name "*.gif" -o -name "*.png" -o -name "*.jpg" \) -exec cp {} "static/" \;
cp assets/* static/
