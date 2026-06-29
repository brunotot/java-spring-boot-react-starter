# DELETE VPS APP GUIDE

## Table of Contents

- [Assumptions](#assumptions)
- [Estimated Time](#estimated-time)
- [Deletion Steps](#deletion-steps)
- [Final Checks](#final-checks)
- [Common Commands](#common-commands)

---

## Assumptions

- App is deployed on a VPS.
- App uses Caddy for HTTPS and reverse proxy.
- App backend runs as a Spring Boot systemd service.
- App files are stored under `/opt/apps`.
- PostgreSQL runs in Docker.
- PostgreSQL data is stored in a Docker volume.
- GitHub Actions self-hosted runner may exist for the app.
- DNS is managed in Hetzner/konsoleH.
- You have SSH access to the VPS.
- You intentionally want to remove this deployed app.

---

## Estimated Time

```txt
Careful app deletion with backup: 20-45 minutes
With DNS/runner cleanup issues: 45-90 minutes
With production data review before deletion: depends on backup/recovery policy
```

---

## Deletion Steps

## Step 1 - Inventory Existing App Resources

`VPS`

- **1.1**: Define values

```bash
APP_NAME=${APP_NAME}
APP_DOMAIN=${APP_DOMAIN}
APP_BACKEND_PORT=${APP_BACKEND_PORT}

VPS_APP_DIR=${VPS_APP_DIR}
VPS_SYSTEMD_SERVICE=${VPS_SYSTEMD_SERVICE}

DB_CONTAINER=${DB_CONTAINER}
DB_VOLUME=${DB_VOLUME}

RUNNER_DIR=${RUNNER_DIR}
```

- **1.2**: Check systemd service

```bash
systemctl status "$VPS_SYSTEMD_SERVICE" --no-pager || true
```

- **1.3**: Check app directory

```bash
ls -la "$VPS_APP_DIR" || true
```

- **1.4**: Check Docker container

```bash
docker ps -a --filter "name=^/${DB_CONTAINER}$"
```

- **1.5**: Check Docker volumes matching the configured volume name

```bash
docker volume ls | grep "$DB_VOLUME" || true
```

- **1.6**: Check Caddy references

```bash
grep -n "$APP_DOMAIN\|$VPS_APP_DIR\|$APP_NAME" /etc/caddy/Caddyfile || true
```

- **1.7**: Check GitHub runner directory

```bash
ls -la "$RUNNER_DIR" || true
```

- **1.8**: Check runner services

```bash
systemctl list-units --type=service --all | grep actions.runner || true
```

---

## Step 2 - Create Backup

`VPS`

- **2.1**: Define backup values

```bash
APP_NAME=${APP_NAME}
VPS_APP_DIR=${VPS_APP_DIR}

DB_CONTAINER=${DB_CONTAINER}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}

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
cp "$VPS_APP_DIR/.env" "$BACKUP_DIR/app-files/.env"
cp "$VPS_APP_DIR/docker-compose.yml" "$BACKUP_DIR/app-files/docker-compose.yml"
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

- **2.7**: Expected result

```txt
Database dump exists.
App .env file is backed up.
App docker-compose.yml file is backed up.
Caddyfile backup exists.
```

---

## Step 3 - Remove App From Caddy

`VPS`

- **3.1**: Define domain

```bash
APP_DOMAIN=${APP_DOMAIN}
```

- **3.2**: Backup current Caddyfile

```bash
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.before-${APP_DOMAIN}-removal
```

- **3.3**: Remove the domain block from Caddyfile

```bash
python3 - "$APP_DOMAIN" <<'PY'
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
grep -n "${APP_DOMAIN}\|${VPS_APP_DIR}\|${APP_NAME}" /etc/caddy/Caddyfile || true
```

---

## Step 4 - Remove Backend Service

`VPS`

- **4.1**: Define service

```bash
VPS_SYSTEMD_SERVICE=${VPS_SYSTEMD_SERVICE}
VPS_JAR_PATH=${VPS_JAR_PATH}
```

- **4.2**: Stop and disable service

```bash
systemctl stop "$VPS_SYSTEMD_SERVICE"
systemctl disable "$VPS_SYSTEMD_SERVICE"
```

- **4.3**: Remove service file

```bash
rm -f "/etc/systemd/system/$VPS_SYSTEMD_SERVICE"
```

- **4.4**: Reload systemd

```bash
systemctl daemon-reload
systemctl reset-failed
```

- **4.5**: Verify service is gone and backend process is stopped

```bash
systemctl status "$VPS_SYSTEMD_SERVICE" --no-pager || true
ps aux | grep "[j]ava .*${VPS_JAR_PATH}" || true
```

---

## Step 5 - Remove PostgreSQL Container

`VPS`

- **5.1**: Define container

```bash
DB_CONTAINER=${DB_CONTAINER}
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

- **5.4**: Expected result

```txt
Only the Docker table header is shown.
No container row exists for the removed app.
```

---

## Step 6 - Remove PostgreSQL Volume

`VPS`

- **6.1**: List matching app volumes before deleting

```bash
DB_VOLUME=${DB_VOLUME}
docker volume ls | grep "$DB_VOLUME" || true
```

- **6.2**: Detect actual Docker volume name

```bash
DB_VOLUME_TO_REMOVE="$(docker volume ls --format '{{.Name}}' | grep -E "(^|_)${DB_VOLUME}$" | head -n 1)"

if [ -z "$DB_VOLUME_TO_REMOVE" ]; then
  echo "No matching Docker volume found for: $DB_VOLUME"
  exit 1
fi

echo "$DB_VOLUME_TO_REMOVE"
```

- **6.3**: Confirm database volume deletion is intentional

```txt
This deletes the database data for the app.
Only continue if the backup from Step 2 exists and this database can be removed.
```

- **6.4**: Remove volume

```bash
docker volume rm "$DB_VOLUME_TO_REMOVE"
```

- **6.5**: Verify volume is gone

```bash
docker volume ls | grep "$DB_VOLUME" || true
```

---

## Step 7 - Remove App Files

`VPS`

- **7.1**: Define app directory

```bash
VPS_APP_DIR=${VPS_APP_DIR}
```

- **7.2**: Check app directory before removal

```bash
ls -la "$VPS_APP_DIR"
```

- **7.3**: Remove app directory

```bash
rm -rf "$VPS_APP_DIR"
```

- **7.4**: Verify app directory is gone

```bash
ls -la "$VPS_APP_DIR" || true
ls -la /opt/apps
```

---

## Step 8 - Remove GitHub Actions Runner

`VPS`

- **8.1**: Define runner directory

```bash
RUNNER_DIR=${RUNNER_DIR}
```

- **8.2**: Inspect runner service name

```bash
cat "$RUNNER_DIR/.service" || true
systemctl list-units --type=service --all | grep actions.runner || true
```

- **8.3**: Define runner service from the runner metadata file

```bash
if [ ! -f "$RUNNER_DIR/.service" ]; then
  echo "No runner service metadata file found. If this app has no runner, skip to Step 9."
  exit 1
fi

RUNNER_SERVICE="$(cat "$RUNNER_DIR/.service")"
echo "$RUNNER_SERVICE"
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

## Step 9 - Remove DNS Record

`Hetzner - konsoleH dashboard`

- **9.1**: Open `Networking -> DNS`
- **9.2**: Open the domain DNS zone
- **9.3**: Find the app DNS record

```txt
Type:  A
Name:  ${APP_NAME}
Value: ${VPS_IP}
```

- **9.4**: Delete the DNS record
- **9.5**: Save/apply changes if required

`Local machine`

- **9.6**: Check DNS

```bash
dig @1.1.1.1 ${APP_DOMAIN} A +short
```

- **9.7**: Should eventually output nothing

```txt
DNS may keep returning the old IP until the TTL expires.
```

---

## Final Checks

`VPS`

- **1**: Define values

```bash
APP_NAME=${APP_NAME}
APP_DOMAIN=${APP_DOMAIN}
APP_BACKEND_PORT=${APP_BACKEND_PORT}

VPS_APP_DIR=${VPS_APP_DIR}
VPS_SYSTEMD_SERVICE=${VPS_SYSTEMD_SERVICE}

DB_CONTAINER=${DB_CONTAINER}
DB_VOLUME=${DB_VOLUME}

RUNNER_DIR=${RUNNER_DIR}
```

- **2**: Check removed resources

```bash
systemctl status "$VPS_SYSTEMD_SERVICE" --no-pager || true
ls -la "$VPS_APP_DIR" || true
docker ps -a | grep "$DB_CONTAINER" || true
docker volume ls | grep "$DB_VOLUME" || true
grep -n "$APP_DOMAIN\|$VPS_APP_DIR\|$APP_NAME" /etc/caddy/Caddyfile || true
ls -la "$RUNNER_DIR" || true
systemctl list-units --type=service --all | grep actions.runner || true
ss -ltnp | grep -E ":${APP_BACKEND_PORT}|:5432" || true
```

- **3**: Expected result

```txt
No app service.
No app directory.
No app Docker container.
No app Docker volume.
No app Caddy references.
No app runner directory.
No app runner service.
No app backend/database ports listening.
```

---

## Common Commands

List systemd services matching app:

```bash
systemctl list-units --type=service --all | grep ${APP_NAME} || true
```

List Docker containers matching app:

```bash
docker ps -a | grep ${APP_NAME} || true
```

List Docker volumes matching configured database volume:

```bash
docker volume ls | grep ${DB_VOLUME} || true
```

List Caddy references matching app:

```bash
grep -n "${APP_DOMAIN}\|${VPS_APP_DIR}\|${APP_NAME}" /etc/caddy/Caddyfile || true
```

List runner services:

```bash
systemctl list-units --type=service --all | grep actions.runner || true
```

Check listening ports:

```bash
ss -ltnp
```
