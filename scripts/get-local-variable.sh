#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 --key=ENV_KEY" >&2
}

fail() {
  echo "Error: $1" >&2
  exit 1
}

KEY=""

for arg in "$@"; do
  case "$arg" in
    --key=*)
      KEY="${arg#*=}"
      ;;
    *)
      fail "Unknown argument: $arg"
      ;;
  esac
done

if [ -z "$KEY" ]; then
  usage
  exit 1
fi

if [[ ! "$KEY" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
  fail "Key is malformed: $KEY"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
VARS_FILE="${REPO_ROOT}/.local/variables.env"

[ -f "$VARS_FILE" ] || fail "Variables file does not exist: $VARS_FILE"

VALUE="$(
  awk -v key="$KEY" '
    BEGIN { found = 0 }
    /^[[:space:]]*$/ { next }
    /^[[:space:]]*#/ { next }
    {
      line = $0
      sub(/\r$/, "", line)
      if (line ~ "^[[:space:]]*" key "=") {
        sub("^[[:space:]]*" key "=", "", line)
        print line
        found = 1
        exit
      }
    }
    END {
      if (found == 0) {
        exit 2
      }
    }
  ' "$VARS_FILE"
)" || fail "Key not found in ${VARS_FILE}: ${KEY}"

printf '%s\n' "$VALUE"
