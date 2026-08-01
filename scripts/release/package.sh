#!/usr/bin/env bash
set -euo pipefail

readonly ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
readonly ARCHIVE="$ROOT/code.zip"
readonly RUNTIME_FILES=(
  app.mjs
  compile.mjs
  config.mjs
  http.mjs
  i18n.mjs
  load.mjs
  server.mjs
  service.mjs
)
readonly REQUIRED=(
  package.json
  package-lock.json
  dist/index.html
  scripts/demo/server.mjs
  data/catalog.json
  data/catalog-index.json
  node_modules/@babel/core/package.json
  node_modules/solid-js/package.json
  node_modules/typescript/package.json
)

for command in npm zip unzip rg sha256sum; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "$command is required to build code.zip" >&2
    exit 1
  fi
done

cd "$ROOT"
npm run build
mkdir -p "$ROOT/.tmp"
stage=$(mktemp -d "$ROOT/.tmp/package.XXXXXX")
listing=$(mktemp)
trap 'rm -rf "$stage"; rm -f "$listing"' EXIT

cp package.json package-lock.json "$stage/"
cp -R dist data "$stage/"
mkdir -p "$stage/scripts/demo"
for file in "${RUNTIME_FILES[@]}"; do
  cp "$ROOT/scripts/demo/$file" "$stage/scripts/demo/"
done

(
  cd "$stage"
  npm ci --omit=dev --ignore-scripts
  npm prune --omit=dev --ignore-scripts
)

rm -f "$ARCHIVE"
(
  cd "$stage"
  zip -rq -y "$ARCHIVE" .
)

unzip -Z1 "$ARCHIVE" >"$listing"
for file in "${REQUIRED[@]}"; do
  if ! rg -F -x "$file" "$listing" >/dev/null; then
    echo "Missing required package file: $file" >&2
    exit 1
  fi
done
if rg -q '^(src/|tests/|playwright-report/|test-results/|node_modules/@playwright/)' "$listing"; then
  echo "Development-only files were found in code.zip" >&2
  exit 1
fi
node "$ROOT/scripts/release/smoke.mjs" "$ARCHIVE"

printf 'archive=%s\nsize=%s\nentries=%s\nsha256=%s\n' \
  "$ARCHIVE" \
  "$(du -h "$ARCHIVE" | cut -f1)" \
  "$(wc -l <"$listing")" \
  "$(sha256sum "$ARCHIVE" | cut -d' ' -f1)"
