#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

LOCAL_DIR="${REPO_ROOT}/.local"
VARS_FILE="${LOCAL_DIR}/variables.env"

mkdir -p "$LOCAL_DIR"
touch "$VARS_FILE"

cat > "$VARS_FILE" <<'EOF'
# This example uses "starter" as the placeholder application name.
# Replace all "starter" values with the actual application name.
# Review and update all default values before generating the deployment guide.

# Absolute path to the repository on the local development machine.
LOCAL_REPO_ROOT=/home/bruno/Desktop/private/java/starter

# Local repository - current group ID used in the backend source code before renaming.
LOCAL_REPO_OLD_GROUP_ID=com.brunotot

# Local repository - current artifact ID used in the backend source code before renaming.
LOCAL_REPO_OLD_ARTIFACT_ID=starter

# Local repository - new group ID to be used in the backend source code after renaming.
LOCAL_REPO_NEW_GROUP_ID=com.brunotot

# Local repository - new artifact ID to be used in the backend source code after renaming.
LOCAL_REPO_NEW_ARTIFACT_ID=leather_proizvodnja

# Local Spring datasource URL used when running the backend locally.
LOCAL_SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/leather_proizvodnja

# Local Spring datasource username used when running the backend locally.
LOCAL_SPRING_DATASOURCE_USERNAME=leather_proizvodnja

# Local Spring datasource password used when running the backend locally.
LOCAL_SPRING_DATASOURCE_PASSWORD=kistibojice

# Short application name used for folders, service names, labels, and generated examples.
APP_NAME=starter

# Public domain where the application will be available.
APP_DOMAIN=starter.brunotot.com

# Port on the VPS where the Spring Boot backend will listen.
APP_BACKEND_PORT=8081

# Public IP address of the VPS.
VPS_IP=46.224.72.162

# Linux user used for SSH access and deployment commands.
VPS_DEPLOY_USER=deploy

# Name of the systemd service that runs the Spring Boot backend.
VPS_SYSTEMD_SERVICE=starter.service

# Root directory on the VPS where application files are stored.
VPS_APP_DIR=/opt/apps/starter

# Directory on the VPS where built React frontend files are stored.
VPS_FRONTEND_DIR=/opt/apps/starter/frontend

# Full path on the VPS where the backend JAR is deployed.
VPS_JAR_PATH=/opt/apps/starter/starter.jar

# Name of the backend JAR file produced by the local Gradle build.
VPS_JAR_FILE=starter-0.0.1-SNAPSHOT.jar

# Full path to the production environment file on the VPS.
VPS_ENV_PATH=/opt/apps/starter/.env

# Docker container name for the PostgreSQL database.
DB_CONTAINER=starter-postgres

# PostgreSQL database name used by the application.
DB_NAME=starter

# PostgreSQL username used by the application.
DB_USER=starter_user

# PostgreSQL password used by the application.
DB_PASSWORD=REPLACE_WITH_STRONG_PASSWORD

# Docker volume name used to persist PostgreSQL data.
DB_VOLUME=starter_postgres_data

# Directory on the VPS where the GitHub Actions self-hosted runner is installed.
RUNNER_DIR=/opt/actions-runner/starter

# GitHub Actions runner label used by the deployment workflow.
RUNNER_LABEL=starter

# Display name of the GitHub Actions self-hosted runner.
RUNNER_NAME=starter-vps-main-01
EOF

chmod 700 "$LOCAL_DIR"
chmod 600 "$VARS_FILE"

echo "Created ${VARS_FILE}"
