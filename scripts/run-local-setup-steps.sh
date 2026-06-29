#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "Error: $1" >&2
  exit 1
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "$REPO_ROOT"

VARS_FILE=".local/variables.env"

[ -f "$VARS_FILE" ] || fail "Missing ${VARS_FILE}. Run ./scripts/create-local-variables-env.sh and populate it first."
[ -f "scripts/substitute-vars.sh" ] || fail "Missing scripts/substitute-vars.sh"
[ -f "scripts/get-local-variable.sh" ] || fail "Missing scripts/get-local-variable.sh"
[ -f "scripts/rename-backend-package.sh" ] || fail "Missing scripts/rename-backend-package.sh"

echo "Step 1: Generate .vscode/settings.json"
mkdir -p .vscode
bash ./scripts/substitute-vars.sh \
  --vars-file=.local/variables.env \
  --input-file=templates/vscode-settings.template.json \
  --output-file=.vscode/settings.json

echo "Step 2: Generate .vscode/launch.json"
mkdir -p .vscode
bash ./scripts/substitute-vars.sh \
  --vars-file=.local/variables.env \
  --input-file=templates/vscode-launch.template.json \
  --output-file=.vscode/launch.json

echo "Step 3: Generate .local/DEPLOYMENT_GUIDE_MINIMAL.gen.md"
bash ./scripts/substitute-vars.sh \
  --vars-file=.local/variables.env \
  --input-file=templates/deployment-guide-minimal.template.md \
  --output-file=.local/DEPLOYMENT_GUIDE_MINIMAL.gen.md

echo "Step 4: Generate .github/workflows/deploy.yml"
mkdir -p .github/workflows
bash ./scripts/substitute-vars.sh \
  --vars-file=.local/variables.env \
  --input-file=templates/deploy.template.yml \
  --output-file=.github/workflows/deploy.yml \
  --ignore-missing=true

echo "Step 5: Apply project-specific patches"
bash ./scripts/rename-backend-package.sh \
  --old-group="$(bash ./scripts/get-local-variable.sh --key=LOCAL_REPO_OLD_GROUP_ID)" \
  --old-artifact="$(bash ./scripts/get-local-variable.sh --key=LOCAL_REPO_OLD_ARTIFACT_ID)" \
  --new-group="$(bash ./scripts/get-local-variable.sh --key=LOCAL_REPO_NEW_GROUP_ID)" \
  --new-artifact="$(bash ./scripts/get-local-variable.sh --key=LOCAL_REPO_NEW_ARTIFACT_ID)"

echo "Local setup completed. You can now commit and push the changes to your repository."
