#!/bin/bash
# Build script for 北科大 SSO+
# Usage:
#   ./build.sh chrome   - Package for Chrome
#   ./build.sh firefox  - Package for Firefox
#   ./build.sh both     - Package for both

set -e

EXCLUDE_PATTERNS=(".git/*" ".github/*" "_metadata/*" "manifest.firefox.json" "build.sh" "*.zip" "docs/*")
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS -x \"$pattern\""
done

build_chrome() {
  echo "Building for Chrome..."
  eval zip -r chrome.zip . $EXCLUDE_ARGS
  echo "Created chrome.zip"
}

build_firefox() {
  echo "Building for Firefox..."
  cp manifest.json manifest.chrome.bak
  cp manifest.firefox.json manifest.json
  eval zip -r firefox.zip . $EXCLUDE_ARGS
  mv manifest.chrome.bak manifest.json
  echo "Created firefox.zip"
}

case "${1:-both}" in
  chrome)  build_chrome ;;
  firefox) build_firefox ;;
  both)    build_chrome; build_firefox ;;
  *)       echo "Usage: $0 {chrome|firefox|both}"; exit 1 ;;
esac
