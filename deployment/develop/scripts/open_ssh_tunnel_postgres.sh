#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

if [ -e "open_ssh_tunnel_postgres.pid" ]; then
    cat <<EOF
There's an open_ssh_tunnel_postgres.pid file, which means that either a tunnel has already opened or a tunnel has been closed incorrectly.
To fix this problem, run "./scripts/close_ssh_tunnel_postgres.sh".
EOF
    exit 1
fi

if [ -z "${INSTANCE_DEVELOP_POSTGRES_PORT}" ]; then
    echo "Error : INSTANCE_DEVELOP_POSTGRES_PORT environment variable is not defined or empty"
    exit 1
fi

nohup ssh -L ${INSTANCE_DEVELOP_POSTGRES_PORT}:127.0.0.1:${INSTANCE_DEVELOP_POSTGRES_PORT} triton -N 2>/dev/null &

SSH_PID=$!

echo ${SSH_PID} > open_ssh_tunnel_postgres.pid
