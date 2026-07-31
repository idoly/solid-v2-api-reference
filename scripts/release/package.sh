#!/usr/bin/env bash
set -euo pipefail

readonly ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
readonly ARCHIVE="$ROOT/code.zip"
readonly REQUIRED=(
  package.json
  dist/index.html
  scripts/demo/server.mjs
  data/catalog.json
  data/catalog-index.json
)

for command in npm zip unzip rg sha256sum; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "$command is required to build code.zip" >&2
    exit 1
  fi
done

cd "$ROOT"
npm run build
rm -f "$ARCHIVE"
zip -rq -y "$ARCHIVE" ./ \
  -x '.git/*' \
     '.generated/*' \
     '.tmp/*' \
     'dist/.vite/*' \
     'playwright-report/*' \
     'test-results/*' \
     'code.zip'

listing=$(mktemp)
trap 'rm -f "$listing"' EXIT
unzip -Z1 "$ARCHIVE" >"$listing"
for file in "${REQUIRED[@]}"; do
  if ! rg -F -x "$file" "$listing" >/dev/null; then
    echo "Missing required package file: $file" >&2
    exit 1
  fi
done
if rg -q '^(\.git/|test-results/|playwright-report/)' "$listing"; then
  echo "Excluded files were found in code.zip" >&2
  exit 1
fi

printf 'archive=%s\nsize=%s\nentries=%s\nsha256=%s\n' \
  "$ARCHIVE" \
  "$(du -h "$ARCHIVE" | cut -f1)" \
  "$(wc -l <"$listing")" \
  "$(sha256sum "$ARCHIVE" | cut -d' ' -f1)"
