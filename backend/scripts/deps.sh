#!/bin/sh
set -eu

ACTION="${1:-check}"

case "$ACTION" in
  check)
    composer outdated || true
    ;;
  update)
    composer update --with-all-dependencies
    php artisan test
    ;;
  *)
    echo "Usage: sh scripts/deps.sh [check|update]" >&2
    exit 1
    ;;
esac
