#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

ssh triton 'mkdir -p /srv/notes.develop.sklein.xyz/'

echo "Export image"
docker save sklein-pkm-engine-postgres:develop | pv > /tmp/sklein-pkm-engine-postgres_develop.tar

echo "Transfert image"
rsync -vz --info=progress2 /tmp/sklein-pkm-engine-postgres_develop.tar triton:/srv/notes.develop.sklein.xyz/sklein-pkm-engine-postgres_develop.tar
rm -rf /tmp/sklein-pkm-engine-postgres_develop.tar

echo "Load image"
ssh triton 'docker load -i /srv/notes.develop.sklein.xyz/sklein-pkm-engine-postgres_develop.tar'
