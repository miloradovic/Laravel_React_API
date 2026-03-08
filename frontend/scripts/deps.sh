#!/bin/sh
set -eu

ACTION="${1:-check}"

case "$ACTION" in
  check)
    npm outdated || true
    ;;
  update)
    npm update
    npm run lint
    npm run build
    ;;
  update-major)
    npx -y npm-check-updates -u
    npm install
    npm run lint
    npm run build
    ;;
  *)
    echo "Usage: sh scripts/deps.sh [check|update|update-major]" >&2
    exit 1
    ;;
esac
