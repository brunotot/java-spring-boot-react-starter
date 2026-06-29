# DELETE VPS APP GUIDE

## Table of Contents

- [Purpose](#purpose)
- [Variables](#variables)
- [Safety Notes](#safety-notes)
- [Deletion Steps](#deletion-steps)
- [Final Checks](#final-checks)
- [Common Commands](#common-commands)

---

## Purpose

This guide removes one deployed app from a VPS.

It covers:

- Caddy site config
- Spring Boot systemd service
- PostgreSQL Docker container
- PostgreSQL Docker volume
- App files under `/opt/apps`
- GitHub Actions self-hosted runner
- DNS record

---

## Variables

Populate these values before following the guide.

```sh
APP_NAME="starter"
DOMAIN="starter.brunotot.com"
VPS_IP="46.224.72.162"

APP_DIR="/opt/apps/starter"
SERVICE="starter.service"

DB_CONTAINER="starter-postgres"
DB_NAME="starter"
DB_USER="starter_user"
DB_VOLUME="starter_starter_postgres_data"

RUNNER_DIR="/opt/actions-runner/starter"
RUNNER_SERVICE="actions.runner.brunotot-java-spring-boot-react-starter.starter-vps-main-01.service"
```

---

## Safety Notes

- Removing the app folder does not remove database data.
- Removing the Docker container does not remove database data.
- Removing the Docker volume deletes the database data for that app.
- Always create a database backup before removing the Docker volume.
- Do not run broad delete commands against `/opt/apps`, `/opt/actions-runner`, Docker volumes, or systemd services.
- Verify each resource name before removing it.

---

## Deletion Steps

## Step 1 — Inventory Existing App Resources

`VPS`

- **1.1**: Define variables

```bash
APP_NAME=starter
DOMAIN=starter.brunotot.com
APP_DIR=/opt/apps/starter
SERVICE=starter.service
DB_CONTAINER=starter-postgres
DB_VOLUME=starter_starter_postgres_data
RUNNER_DIR=/opt/actions-runner/starter
```

- **1.2**: Check systemd service

```bash
systemctl status "$SERVICE" --no-pager || true
```

- **1.3**: Check app directory

```bash
ls -la "$APP_DIR" || true
```

- **1.4**: Check Docker container

```bash
docker ps -a --filter "name=^/${DB_CONTAINER}$"
```

- **1.5**: Check Docker volume

```bash
docker volume ls | grep "$DB_VOLUME" || true
```

- **1.6**: Check Caddy references

```bash
grep -n "$DOMAIN\|$APP_DIR\|$APP_NAME" /etc/caddy/Caddyfile || true
```

- **1.7**: Check GitHub runner directory

```bash
ls -la "$RUNNER_DIR" || true
```

---

## Step 2 — Create Backup

`VPS`

- **2.1**: Define backup variables

```bash
APP_NAME=starter
APP_DIR=/opt/apps/starter
DB_CONTAINER=starter-postgres
DB_NAME=starter
DB_USER=starter_user
BACKUP_DIR="/root/${APP_NAME}-removal-backup-$(date +%Y-%m-%d_%H-%M-%S)"
```

- **2.2**: Create backup directory

```bash
mkdir -p "$BACKUP_DIR"
```

- **2.3**: Backup database

```bash
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/${DB_NAME}.sql"
```

- **2.4**: Backup app configuration files

```bash
mkdir -p "$BACKUP_DIR/app-files"
cp "$APP_DIR/.env" "$BACKUP_DIR/app-files/.env"
cp "$APP_DIR/docker-compose.yml" "$BACKUP_DIR/app-files/docker-compose.yml"
```

- **2.5**: Backup Caddyfile

```bash
cp /etc/caddy/Caddyfile "$BACKUP_DIR/Caddyfile.before-${APP_NAME}-removal"
```

- **2.6**: Verify backup

```bash
ls -la "$BACKUP_DIR"
ls -la "$BACKUP_DIR/app-files"
```

---

## Step 3 — Remove App From Caddy

`VPS`

- **3.1**: Define domain

```bash
DOMAIN=starter.brunotot.com
```

- **3.2**: Backup current Caddyfile

```bash
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.before-${DOMAIN}-removal
```

- **3.3**: Remove the domain block from Caddyfile

```bash
python3 - "$DOMAIN" <<'PY'
from pathlib import Path
import sys

domain = sys.argv[1]
path = Path("/etc/caddy/Caddyfile")
text = path.read_text()

start = text.find(domain + " {")
if start == -1:
    raise SystemExit(f"Could not find Caddy block for {domain}")

brace_start = text.find("{", start)
depth = 0
end = None

for i in range(brace_start, len(text)):
    if text[i] == "{":
        depth += 1
    elif text[i] == "}":
        depth -= 1
        if depth == 0:
            end = i + 1
            break

if end is None:
    raise SystemExit(f"Could not find end of Caddy block for {domain}")

before = text[:start].rstrip()
after = text[end:].lstrip()
new_text = before + "\n\n" + after if after else before + "\n"

path.write_text(new_text)
PY
```

- **3.4**: Format, validate, and reload Caddy

```bash
caddy fmt --overwrite /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

- **3.5**: Verify app references are gone

```bash
grep -n "$DOMAIN\|/opt/apps/starter\|starter" /etc/caddy/Caddyfile || true
```

---

## Step 4 — Remove Backend Service

`VPS`

- **4.1**: Define service

```bash
SERVICE=starter.service
```

- **4.2**: Stop and disable service

```bash
systemctl stop "$SERVICE"
systemctl disable "$SERVICE"
```

- **4.3**: Remove service file

```bash
rm -f "/etc/systemd/system/$SERVICE"
```

- **4.4**: Reload systemd

```bash
systemctl daemon-reload
systemctl reset-failed
```

- **4.5**: Verify service is gone

```bash
systemctl status "$SERVICE" --no-pager || true
ps aux | grep '[s]tarter.jar' || true
```

---

## Step 5 — Remove PostgreSQL Container

`VPS`

- **5.1**: Define container

```bash
DB_CONTAINER=starter-postgres
```

- **5.2**: Stop and remove container

```bash
docker stop "$DB_CONTAINER"
docker rm "$DB_CONTAINER"
```

- **5.3**: Verify container is gone

```bash
docker ps -a --filter "name=^/${DB_CONTAINER}$"
```

---

## Step 6 — Remove PostgreSQL Volume

`VPS`

- **6.1**: List app volumes before deleting

```bash
docker volume ls | grep starter
```

- **6.2**: Define exact volume name

```bash
DB_VOLUME=starter_starter_postgres_data
```

- **6.3**: Remove volume

```bash
docker volume rm "$DB_VOLUME"
```

- **6.4**: Verify volume is gone

```bash
docker volume ls | grep starter || true
```

---

## Step 7 — Remove App Files

`VPS`

- **7.1**: Define app directory

```bash
APP_DIR=/opt/apps/starter
```

- **7.2**: Check app directory before removal

```bash
ls -la "$APP_DIR"
```

- **7.3**: Remove app directory

```bash
rm -rf "$APP_DIR"
```

- **7.4**: Verify app directory is gone

```bash
ls -la "$APP_DIR" || true
ls -la /opt/apps
```

---

## Step 8 — Remove GitHub Actions Runner

`VPS`

- **8.1**: Define runner directory

```bash
RUNNER_DIR=/opt/actions-runner/starter
```

- **8.2**: Inspect runner service name

```bash
cat "$RUNNER_DIR/.service" || true
systemctl list-units --type=service --all | grep actions.runner || true
```

- **8.3**: Define runner service

```bash
RUNNER_SERVICE="actions.runner.brunotot-java-spring-boot-react-starter.starter-vps-main-01.service"
```

- **8.4**: Stop runner service

```bash
systemctl stop "$RUNNER_SERVICE"
```

- **8.5**: Run official runner service uninstall

```bash
cd "$RUNNER_DIR"
./svc.sh uninstall || true
```

- **8.6**: Remove runner service leftovers

```bash
systemctl stop "$RUNNER_SERVICE" 2>/dev/null || true
systemctl disable "$RUNNER_SERVICE" 2>/dev/null || true
rm -f "/etc/systemd/system/$RUNNER_SERVICE"
systemctl daemon-reload
systemctl reset-failed
```

- **8.7**: Remove runner directory

```bash
cd /root
rm -rf "$RUNNER_DIR"
```

- **8.8**: Verify runner is gone

```bash
systemctl list-units --type=service --all | grep actions.runner || true
ls -la "$RUNNER_DIR" || true
```

---

## Step 9 — Remove DNS Record

`Hetzner - konsoleH dashboard`

- **9.1**: Open `Networking → DNS`
- **9.2**: Open the domain DNS zone
- **9.3**: Find the app DNS record

```txt
Type:  A
Name:  starter
Value: 46.224.72.162
```

- **9.4**: Delete the DNS record
- **9.5**: Save/apply changes if required

`Local machine`

- **9.6**: Check DNS

```bash
dig @1.1.1.1 starter.brunotot.com A +short
```

- **9.7**: Should eventually output nothing

DNS may keep returning the old IP until the TTL expires.

---

## Final Checks

`VPS`

- **1**: Define values

```bash
APP_NAME=starter
DOMAIN=starter.brunotot.com
APP_DIR=/opt/apps/starter
SERVICE=starter.service
DB_CONTAINER=starter-postgres
RUNNER_DIR=/opt/actions-runner/starter
```

- **2**: Check removed resources

```bash
systemctl status "$SERVICE" --no-pager || true
ls -la "$APP_DIR" || true
docker ps -a | grep "$DB_CONTAINER" || true
docker volume ls | grep "$APP_NAME" || true
grep -n "$DOMAIN\|$APP_DIR\|$APP_NAME" /etc/caddy/Caddyfile || true
ls -la "$RUNNER_DIR" || true
systemctl list-units --type=service --all | grep actions.runner || true
ss -ltnp | grep -E ':8081|:5432' || true
```

- **3**: Expected result

```txt
No app service
No app directory
No app Docker container
No app Docker volume
No app Caddy references
No app runner directory
No app runner service
No app backend/database ports listening
```

---

## Common Commands

List systemd services matching app:

```bash
systemctl list-units --type=service --all | grep starter || true
```

List Docker containers matching app:

```bash
docker ps -a | grep starter || true
```

List Docker volumes matching app:

```bash
docker volume ls | grep starter || true
```

List Caddy references matching app:

```bash
grep -n "starter.brunotot.com\|/opt/apps/starter\|starter" /etc/caddy/Caddyfile || true
```

List runner services:

```bash
systemctl list-units --type=service --all | grep actions.runner || true
```

Check listening ports:

```bash
ss -ltnp
```
