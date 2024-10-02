#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

ssh triton 'mkdir -p /srv/notes.sklein.xyz/'

echo "Export image"
docker save sklein-pkm-engine-webapp:prod | pv > /tmp/sklein-pkm-engine-webapp_prod.tar

echo "Transfert image"
rsync -vz --info=progress2 /tmp/sklein-pkm-engine-webapp_prod.tar triton:/srv/notes.sklein.xyz/sklein-pkm-engine-webapp_prod.tar
rm -rf /tmp/sklein-pkm-engine-webapp_prod.tar

echo "Load image"
ssh triton 'docker load -i /srv/notes.sklein.xyz/sklein-pkm-engine-webapp_prod.tar'
