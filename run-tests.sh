#!/usr/bin/env bash
#
# Automated Test Runner for Scientific Calculator
# Runs test.html headlessly and prints structured results to stdout.
#

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
TEST_FILE="file://${DIR}/test.html"

echo "🧪 Running Scientific Calculator Automated Test Suite..."
echo ""

# Check for Brave or Firefox
if command -v brave >/dev/null 2>&1; then
  OUTPUT=$(brave --headless --disable-gpu --dump-dom "${TEST_FILE}" 2>/dev/null)
elif command -v firefox >/dev/null 2>&1; then
  OUTPUT=$(firefox --headless --screenshot /dev/null "${TEST_FILE}" 2>/dev/null)
else
  echo "⚠️ No supported headless browser (brave or firefox) found."
  echo "Please open test.html directly in your web browser."
  exit 1
fi

# Extract and format the test log from the console-summary DOM element
SUMMARY=$(echo "${OUTPUT}" | sed -n '/<pre id="console-summary">/,/<\/pre>/p' | sed 's/<pre id="console-summary">//' | sed 's/<\/pre>//' | sed 's/&amp;/&/g')

if [ -n "${SUMMARY}" ]; then
  echo "${SUMMARY}"
else
  echo "Failed to extract test summary from DOM output."
  exit 1
fi

# Exit with error if any tests failed
if echo "${SUMMARY}" | grep -q "[1-9][0-9]* Failed"; then
  echo ""
  echo "❌ Test suite finished with FAILURES."
  exit 1
else
  echo ""
  echo "✅ All tests PASSED successfully!"
  exit 0
fi
