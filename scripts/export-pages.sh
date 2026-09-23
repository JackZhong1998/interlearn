#!/usr/bin/env bash
# GitHub Pages static export. API routes are moved aside because next export cannot ship them.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
API_BAK="$(mktemp -d)/api"
restore() {
  if [ -d "$API_BAK" ]; then
    rm -rf "$ROOT/src/app/api"
    mv "$API_BAK" "$ROOT/src/app/api"
  fi
}
trap restore EXIT
if [ -d src/app/api ]; then
  mv src/app/api "$API_BAK"
fi
export STATIC_EXPORT=1
export NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/interlearn}"
npx next build
touch out/.nojekyll
echo "exported to $ROOT/out (base ${NEXT_PUBLIC_BASE_PATH})"
