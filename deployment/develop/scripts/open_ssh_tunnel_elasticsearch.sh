#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

if [ -e "open_ssh_tunnel_elasticsearch.pid" ]; then
    cat <<EOF
There's an open_ssh_tunnel_elasticsearch.pid file, which means that either a tunnel has already opened or a tunnel has been closed incorrectly.
To fix this problem, run "./scripts/close_ssh_tunnel_elasticsearch.sh".
EOF
    exit 1
fi

if [ -z "${INSTANCE_DEVELOP_ELASTICSEARCH_PORT}" ]; then
    echo "Error : INSTANCE_DEVELOP_ELASTICSEARCH_PORT environment variable is not defined or empty"
    exit 1
fi

nohup ssh -L ${INSTANCE_DEVELOP_ELASTICSEARCH_PORT}:127.0.0.1:${INSTANCE_DEVELOP_ELASTICSEARCH_PORT} triton -N > /dev/null 2>&1 &

SSH_PID=$!

echo ${SSH_PID} > open_ssh_tunnel_elasticsearch.pid
