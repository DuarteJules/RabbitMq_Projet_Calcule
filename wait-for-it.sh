#!/bin/sh

# wait-for-it.sh host port -- command
# Ex: ./wait-for-it.sh rabbitmq 5672 -- node worker.js

HOST="$1"
PORT="$2"
shift 2

echo "Waiting for $HOST:$PORT..."

while ! nc -z "$HOST" "$PORT" >/dev/null 2>&1; do
  sleep 1
done

echo "$HOST:$PORT is available. Running command: $*"

exec "$@"
