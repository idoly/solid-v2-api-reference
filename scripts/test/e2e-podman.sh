#!/usr/bin/env bash
set -euo pipefail

readonly ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
readonly IMAGE=${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright:v1.62.0-noble}

if ! command -v podman >/dev/null 2>&1; then
  echo "Podman is required to run the browser tests." >&2
  exit 1
fi

mkdir -p "$ROOT/test-results" "$ROOT/playwright-report"

exec podman run --rm --init --ipc=host \
  --volume "$ROOT:/work:z" \
  --workdir /work \
  --env CI="${CI:-}" \
  "$IMAGE" \
  npm run test:e2e
