#!/usr/bin/env bash
# Builds the Chrome Web Store upload zip into dist/.
#
# The zip must have manifest.json at its root, so everything is zipped from the
# repository root with development-only files excluded.
#
#   ./scripts/package.sh
#   -> dist/yakipper-<version>.zip
set -euo pipefail

cd "$(dirname "$0")/.."

version=$(node -p "require('./manifest.json').version")
out="dist/yakipper-${version}.zip"

rm -rf dist
mkdir -p dist

zip -r -q "$out" . \
  -x '.git/*' \
  -x '.github/*' \
  -x 'test/*' \
  -x 'scripts/*' \
  -x 'dist/*' \
  -x '*.DS_Store' \
  -x '*.md'

echo "$out"
unzip -l "$out"
