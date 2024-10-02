#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

PID_FILE="open_ssh_tunnel_elasticsearch.pid"

if [ -f ${PID_FILE} ]; then
    SSH_PID=$(cat ${PID_FILE})

    set +e
    kill ${SSH_PID} 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "SSH tunnel elasticsearch closed with success"
        rm -f ${PID_FILE}
    else
        rm -f ${PID_FILE}
        echo "Error, no ssh tunnel was open, the open_ssh_tunnel_elasticsearch.pid file has been deleted to correct this error."
    fi
else
    echo "No open ssh tunnel found"
fi
