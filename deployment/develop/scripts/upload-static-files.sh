#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

ssh triton 'mkdir -p /var/lib/notes.develop.sklein.xyz/static/'
rsync -vzr --info=progress2 ../../static/ triton:/var/lib/notes.develop.sklein.xyz/static/
