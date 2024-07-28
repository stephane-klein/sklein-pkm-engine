#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../../../nginx/"

docker build . -t sklein-pkm-engine-nginx:develop
