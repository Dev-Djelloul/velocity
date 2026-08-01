#!/bin/bash

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8787}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

is_port_used() {
  lsof -Pi ":$1" -sTCP:LISTEN -t >/dev/null 2>&1
}

if is_port_used "$BACKEND_PORT"; then
  for alt in 8788 8789 3001 3002; do
    if ! is_port_used "$alt"; then
      BACKEND_PORT="$alt"
      break
    fi
  done
fi

if is_port_used "$FRONTEND_PORT"; then
  for alt in 4173 4174 3000 8080; do
    if ! is_port_used "$alt"; then
      FRONTEND_PORT="$alt"
      break
    fi
  done
fi

cleanup() {
  echo "\nArrêt des services..."
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "${FRONTEND_PID:-}" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  wait "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" 2>/dev/null || true
  exit 0
}

trap cleanup INT TERM

cd "$ROOT/backend" && npx wrangler dev --port "$BACKEND_PORT" &
BACKEND_PID=$!

sleep 2

cd "$ROOT/frontend" && npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT" &
FRONTEND_PID=$!

echo "Backend : http://localhost:$BACKEND_PORT"
echo "Frontend : http://localhost:$FRONTEND_PORT"

echo "Appuye sur Ctrl+C pour arrêter"

wait "$FRONTEND_PID"
