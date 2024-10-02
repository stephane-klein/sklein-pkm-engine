#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

ssh triton 'mkdir -p /var/lib/notes.sklein.xyz/static/'
rsync -vzr --info=progress2 ../../static/ triton:/var/lib/notes.sklein.xyz/static/
