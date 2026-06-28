# Deployment Guide: Spring Boot + React Starter on Hetzner VPS

This guide documents the complete production deployment of the `java-spring-boot-react-starter` app to:

```txt
https://starter.brunotot.com
```

It includes the final architecture, setup commands, CI/CD workflow, problems encountered, fixes, and future maintenance notes.

---

# Table of Contents

- [1. Final Production Architecture](#1-final-production-architecture)
- [2. DNS Setup](#2-dns-setup)
- [3. VPS Base Setup](#3-vps-base-setup)
- [4. Environment File](#4-environment-file)
- [5. PostgreSQL via Docker Compose](#5-postgresql-via-docker-compose)
- [6. Manual Backend JAR Deployment](#6-manual-backend-jar-deployment)
- [7. Systemd Service](#7-systemd-service)
- [8. Caddy Reverse Proxy](#8-caddy-reverse-proxy)
- [9. Split Frontend Static Hosting](#9-split-frontend-static-hosting)
- [10. GitHub Actions Self-Hosted Runner](#10-github-actions-self-hosted-runner)
- [11. Build Tools on VPS Runner](#11-build-tools-on-vps-runner)
- [12. Sudo Permission for Backend Restart](#12-sudo-permission-for-backend-restart)
- [13. Private npm Registry for `@rgo/front-ui`](#13-private-npm-registry-for-rgofront-ui)
- [14. Final GitHub Actions Workflow](#14-final-github-actions-workflow)
- [15. Deployment Tests Performed](#15-deployment-tests-performed)
- [16. Manual Redeploy Commands](#16-manual-redeploy-commands)
- [17. Useful Production Commands](#17-useful-production-commands)
- [18. Database Backup and Restore](#18-database-backup-and-restore)
- [19. Security Notes](#19-security-notes)
- [20. Troubleshooting](#20-troubleshooting)
- [21. Future Maintenance Notes](#21-future-maintenance-notes)
- [22. Removing the App Later](#22-removing-the-app-later)
- [23. Final Status](#23-final-status)

---

# 1. Final Production Architecture

Final setup:

```txt
https://starter.brunotot.com
  ↓
Caddy HTTPS reverse proxy
  ├─ /       → React static files from /opt/apps/starter/frontend
  └─ /api/*  → Spring Boot backend on 127.0.0.1:8081
                  ↓
                  PostgreSQL Docker container on 127.0.0.1:5432
```

Final deployment behavior:

```txt
Push to main
  ↓
GitHub Actions self-hosted runner on VPS
  ↓
Detect changed files
  ├─ frontend changed → build React → deploy static files → no backend restart
  ├─ backend changed  → build Spring Boot JAR → deploy JAR → restart starter.service
  └─ both changed     → deploy both → restart backend once
```

Important production paths:

```txt
App folder:              /opt/apps/starter
Frontend static files:   /opt/apps/starter/frontend
Backend JAR:             /opt/apps/starter/starter.jar
Environment file:        /opt/apps/starter/.env
Docker Compose file:     /opt/apps/starter/docker-compose.yml
Systemd service:         /etc/systemd/system/starter.service
Caddy config:            /etc/caddy/Caddyfile
GitHub runner folder:    /opt/actions-runner/starter
```

Important production names:

```txt
Domain:                  starter.brunotot.com
VPS IPv4:                46.224.72.162
Linux user:              deploy
Spring Boot service:     starter.service
Spring Boot port:        8081
Postgres container:      starter-postgres
Postgres database:       starter
Postgres user:           starter_user
Docker volume:           starter_postgres_data
```

---

# 2. DNS Setup

## 2.1 DNS record in Hetzner konsoleH

The domain `brunotot.com` is managed in Hetzner `konsoleH`.

For the subdomain, create an `A` record inside the existing `brunotot.com` DNS zone.

Correct record:

```txt
Type:   A
Name:   starter
Value:  46.224.72.162
TTL:    default / 7200
```

Important gotcha:

Do **not** enter the full name:

```txt
starter.brunotot.com
```

inside the `Name` field.

In konsoleH, the zone already appends `brunotot.com`, so entering the full name can accidentally create:

```txt
starter.brunotot.com.brunotot.com
```

Correct value is only:

```txt
starter
```

## 2.2 Verify DNS

From local machine:

```bash
dig @1.1.1.1 starter.brunotot.com A +short
dig @8.8.8.8 starter.brunotot.com A +short
dig @ns1.your-server.de starter.brunotot.com A +short
dig starter.brunotot.com A +short
```

Expected result from public/authoritative resolvers:

```txt
46.224.72.162
```

If public resolvers work but local/default `dig` returns nothing, the problem is local DNS cache, router DNS cache, or ISP DNS cache.

Useful local cache flush commands on Ubuntu:

```bash
sudo resolvectl flush-caches
sudo systemctl restart systemd-resolved
resolvectl query starter.brunotot.com
```

You can also bypass DNS for a direct test:

```bash
curl -I --resolve starter.brunotot.com:443:46.224.72.162 https://starter.brunotot.com
```

Expected successful response:

```txt
HTTP/2 200
```

---

# 3. VPS Base Setup

## 3.1 Connect to VPS

From local machine:

```bash
ssh deploy@46.224.72.162
```

## 3.2 Create app folder

On VPS as `deploy`:

```bash
sudo mkdir -p /opt/apps/starter
sudo chown -R deploy:deploy /opt/apps/starter
ls -la /opt/apps
```

Expected:

```txt
starter
```

## 3.3 Install Java, Docker, and Docker Compose

On VPS as `deploy`:

```bash
sudo apt update
sudo apt install -y openjdk-21-jre-headless
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker deploy
exit
```

Reconnect so the new Docker group membership applies:

```bash
ssh deploy@46.224.72.162
```

Verify:

```bash
java -version
docker --version
docker compose version
```

Expected:

```txt
Java 21
Docker installed
Docker Compose v2 installed
```

---

# 4. Environment File

On VPS as `deploy`:

```bash
nano /opt/apps/starter/.env
```

Example `.env`:

```env
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8081

SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/starter
SPRING_DATASOURCE_USERNAME=starter_user
SPRING_DATASOURCE_PASSWORD=REPLACE_WITH_STRONG_PASSWORD
```

Protect the file:

```bash
chmod 600 /opt/apps/starter/.env
ls -la /opt/apps/starter/.env
```

Expected:

```txt
-rw------- deploy deploy .env
```

Important:

Never commit this `.env` file into Git.

---

# 5. PostgreSQL via Docker Compose

Create Docker Compose file:

```bash
nano /opt/apps/starter/docker-compose.yml
```

Final working `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:18
    container_name: starter-postgres
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_DB: starter
      POSTGRES_USER: starter_user
      POSTGRES_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
    volumes:
      - starter_postgres_data:/var/lib/postgresql
    ports:
      - "127.0.0.1:5432:5432"

volumes:
  starter_postgres_data:
```

Start Postgres:

```bash
cd /opt/apps/starter
docker compose up -d postgres
docker ps
docker logs starter-postgres
```

Expected:

```txt
starter-postgres   Up
database system is ready to accept connections
```

Verify login:

```bash
docker exec -it starter-postgres psql -U starter_user -d starter
```

Inside `psql`:

```sql
SELECT current_database(), current_user;
```

Expected:

```txt
starter | starter_user
```

Exit:

```sql
\q
```

## PostgreSQL 18 volume mount issue encountered

Initial broken volume mount:

```yaml
volumes:
  - starter_postgres_data:/var/lib/postgresql/data
```

With `postgres:18`, this caused an error because the Docker image expects the volume at:

```txt
/var/lib/postgresql
```

not:

```txt
/var/lib/postgresql/data
```

Final correct mount:

```yaml
volumes:
  - starter_postgres_data:/var/lib/postgresql
```

If the wrong fresh volume was already created, remove it with:

```bash
cd /opt/apps/starter
docker compose down -v
```

Then fix the compose file and start again:

```bash
docker compose up -d postgres
```

---

# 6. Manual Backend JAR Deployment

## 6.1 Build backend locally

From local machine, repo root:

```bash
cd ~/Desktop/private/java/starter
./gradlew clean build
ls -la build/libs
```

Expected JAR:

```txt
starter-0.0.1-SNAPSHOT.jar
```

If there is also a `*-plain.jar`, use the non-plain JAR.

## 6.2 Upload JAR

From local machine, repo root:

```bash
scp build/libs/starter-0.0.1-SNAPSHOT.jar deploy@46.224.72.162:/opt/apps/starter/starter.jar
```

Verify on VPS:

```bash
ssh deploy@46.224.72.162
ls -la /opt/apps/starter
```

Expected:

```txt
starter.jar
.env
docker-compose.yml
```

## 6.3 Manual test run

On VPS as `deploy`:

```bash
cd /opt/apps/starter

set -a
source .env
set +a

java -jar starter.jar
```

In another terminal:

```bash
ssh deploy@46.224.72.162
curl -I http://127.0.0.1:8081
```

Expected:

```txt
HTTP/1.1 200
```

or another valid app response such as `302`.

After testing, stop the manual run with:

```txt
Ctrl + C
```

Manual run is only for testing. The app should be managed by `systemd` in production.

---

# 7. Systemd Service

Create service file:

```bash
sudo nano /etc/systemd/system/starter.service
```

Final `starter.service`:

```ini
[Unit]
Description=Starter Spring Boot App
After=network.target docker.service
Requires=docker.service

[Service]
User=deploy
WorkingDirectory=/opt/apps/starter
EnvironmentFile=/opt/apps/starter/.env
ExecStart=/usr/bin/java -jar /opt/apps/starter/starter.jar
Restart=always
RestartSec=10
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

Reload and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable starter
sudo systemctl start starter
sudo systemctl status starter --no-pager
```

Expected:

```txt
Active: active (running)
```

Check logs:

```bash
sudo journalctl -u starter --no-pager -n 100
```

Restart manually:

```bash
sudo systemctl restart starter
```

---

# 8. Caddy Reverse Proxy

Caddy was already installed on the VPS for the portfolio deployment.

Final relevant Caddy config:

```bash
sudo nano /etc/caddy/Caddyfile
```

The `starter.brunotot.com` block should be:

```caddyfile
starter.brunotot.com {
    handle /api/* {
        reverse_proxy 127.0.0.1:8081
    }

    handle {
        root * /opt/apps/starter/frontend
        try_files {path} /index.html
        file_server
    }
}
```

This means:

```txt
/api/*  → Spring Boot backend
/       → React frontend static files
```

Validate and reload:

```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Test:

```bash
curl -I http://127.0.0.1:8081
curl -I https://starter.brunotot.com
```

If local DNS is stale:

```bash
curl -I --resolve starter.brunotot.com:443:46.224.72.162 https://starter.brunotot.com
```

Expected:

```txt
HTTP/2 200
```

Important note:

This assumes backend API routes are under:

```txt
/api/*
```

If the backend exposes endpoints outside `/api/*`, Caddy config should be adjusted.

---

# 9. Split Frontend Static Hosting

Create frontend production folder:

```bash
sudo mkdir -p /opt/apps/starter/frontend
sudo chown -R deploy:deploy /opt/apps/starter/frontend
ls -la /opt/apps/starter
```

Expected:

```txt
frontend
starter.jar
.env
docker-compose.yml
```

Build frontend locally:

```bash
cd ~/Desktop/private/java/starter/frontend
npm install
npm run build
ls -la dist
```

Upload frontend files from repo root:

```bash
cd ~/Desktop/private/java/starter
rsync -avz --delete frontend/dist/ deploy@46.224.72.162:/opt/apps/starter/frontend/
```

Verify:

```bash
ssh deploy@46.224.72.162
ls -la /opt/apps/starter/frontend
```

Expected:

```txt
index.html
assets/
```

---

# 10. GitHub Actions Self-Hosted Runner

Because the VPS SSH firewall is restricted to Bruno’s IP, GitHub-hosted runners would not be able to SSH into the server.

Solution:

```txt
Use self-hosted GitHub Actions runner on the VPS.
```

This avoids opening SSH to GitHub-hosted runner IPs.

## 11.1 Create runner folder

On VPS as `deploy`:

```bash
sudo mkdir -p /opt/actions-runner/starter
sudo chown -R deploy:deploy /opt/actions-runner/starter
cd /opt/actions-runner/starter
```

## 11.2 Download runner

From GitHub repo:

```txt
Settings → Actions → Runners → New self-hosted runner
```

Choose:

```txt
Linux
x64
```

Example download commands used:

```bash
curl -o actions-runner-linux-x64-2.335.1.tar.gz -L https://github.com/actions/runner/releases/download/v2.335.1/actions-runner-linux-x64-2.335.1.tar.gz

echo "4ef2f25285f0ae4477f1fe1e346db76d2f3ebf03824e2ddd1973a2819bf6c8cf  actions-runner-linux-x64-2.335.1.tar.gz" | sha256sum -c

tar xzf ./actions-runner-linux-x64-2.335.1.tar.gz
```

Important:

Do not copy the `$` symbols from GitHub’s example commands.

## 11.3 Configure runner

Run GitHub’s generated config command:

```bash
cd /opt/actions-runner/starter
./config.sh --url https://github.com/brunotot/java-spring-boot-react-starter --token <TOKEN_FROM_GITHUB>
```

Prompt answers:

```txt
Enter the name of the runner group to add this runner to: [press Enter for Default]
→ press Enter

Enter the name of runner:
→ starter-vps-main-01

Enter any additional labels:
→ starter

Enter name of work folder:
→ press Enter for _work
```

Important issue encountered:

At first, `starter-vps-main-01` was entered as the runner group. That failed:

```txt
Could not find any self-hosted runner group named "starter-vps-main-01"
```

Fix:

Press Enter for the default runner group. Use `starter-vps-main-01` only when asked for the runner name.

## 11.4 Install runner as service

Do not leave the runner running manually via:

```bash
./run.sh
```

Instead install it as a service:

```bash
sudo ./svc.sh install deploy
sudo ./svc.sh start
sudo ./svc.sh status
```

Expected:

```txt
running
```

In GitHub:

```txt
Settings → Actions → Runners
```

Expected:

```txt
starter-vps-main-01 → Idle
```

---

# 11. Build Tools on VPS Runner

Because builds run on the VPS self-hosted runner, install build tools there.

On VPS as `deploy`:

```bash
sudo apt update
sudo apt install -y openjdk-21-jdk-headless curl ca-certificates gnupg rsync
```

Install Node.js 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
sudo apt install -y nodejs
```

Verify:

```bash
java -version
javac -version
node -v
npm -v
rsync --version | head -n 1
```

Expected:

```txt
java 21.x
javac 21.x
node v22.x
npm x.x
rsync version ...
```

---

# 12. Sudo Permission for Backend Restart

GitHub Actions runner runs as Linux user:

```txt
deploy
```

Deploying backend requires restarting:

```txt
starter.service
```

Create sudoers file:

```bash
sudo nano /etc/sudoers.d/starter-deploy
```

Final sudoers content:

```sudoers
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart starter.service, /usr/bin/systemctl restart starter, /bin/systemctl restart starter.service, /bin/systemctl restart starter
```

Set correct permissions:

```bash
sudo chmod 440 /etc/sudoers.d/starter-deploy
```

Validate:

```bash
sudo visudo -cf /etc/sudoers.d/starter-deploy
```

Expected:

```txt
/etc/sudoers.d/starter-deploy: parsed OK
```

Test without cached sudo authentication:

```bash
sudo -k
sudo -n /usr/bin/systemctl restart starter.service
/usr/bin/systemctl status starter.service --no-pager
```

Expected:

```txt
No password prompt
starter.service active/running
```

Issue encountered:

The workflow originally failed with:

```txt
sudo: interactive authentication is required
```

Fix:

Use an exact sudoers command match and call exact path in workflow:

```bash
sudo -n /usr/bin/systemctl restart starter.service
```

---

# 13. Private npm Registry for `@rgo/front-ui`

The frontend uses private package:

```txt
@rgo/front-ui
```

The package is hosted in the company Gitea npm registry.

Locally, this works because `.npmrc` contains registry URL and token.

In GitHub Actions, this initially failed with:

```txt
npm error code E401
npm error Incorrect or missing password.
```

Fix:

Store private registry credentials as GitHub Actions secrets.

GitHub repo:

```txt
Settings → Secrets and variables → Actions → New repository secret
```

Create secrets:

```txt
RGO_NPM_REGISTRY
RGO_NPM_TOKEN
```

Example mapping from local `.npmrc`:

```txt
@rgo:registry=https://git.example.com/api/packages/some-owner/npm/
//git.example.com/api/packages/some-owner/npm/:_authToken=abc123
```

Secrets:

```txt
RGO_NPM_REGISTRY = https://git.example.com/api/packages/some-owner/npm/
RGO_NPM_TOKEN    = abc123
```

Important:

Do not commit `.npmrc` with real token.

The workflow creates a temporary `frontend/.npmrc` during CI.

---

# 14. Final GitHub Actions Workflow

File:

```txt
.github/workflows/deploy.yml
```

Final workflow:

```yaml
name: Deploy Starter

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: [self-hosted, starter]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Detect changed areas
        id: changes
        shell: bash
        run: |
          BEFORE="${{ github.event.before }}"
          AFTER="${{ github.sha }}"

          echo "Before: $BEFORE"
          echo "After:  $AFTER"

          if [ "$BEFORE" = "0000000000000000000000000000000000000000" ]; then
            echo "First push or unknown previous commit. Deploying both frontend and backend."
            echo "frontend_changed=true" >> "$GITHUB_OUTPUT"
            echo "backend_changed=true" >> "$GITHUB_OUTPUT"
            exit 0
          fi

          CHANGED_FILES="$(git diff --name-only "$BEFORE" "$AFTER")"

          echo "Changed files:"
          echo "$CHANGED_FILES"

          if echo "$CHANGED_FILES" | grep -qE '^frontend/'; then
            echo "frontend_changed=true" >> "$GITHUB_OUTPUT"
          else
            echo "frontend_changed=false" >> "$GITHUB_OUTPUT"
          fi

          if echo "$CHANGED_FILES" | grep -qE '^(src/|gradle/|gradlew|gradlew\.bat|build\.gradle|build\.gradle\.kts|settings\.gradle|settings\.gradle\.kts|pom\.xml)'; then
            echo "backend_changed=true" >> "$GITHUB_OUTPUT"
          else
            echo "backend_changed=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Configure private npm registry
        if: steps.changes.outputs.frontend_changed == 'true'
        shell: bash
        env:
          RGO_NPM_REGISTRY: ${{ secrets.RGO_NPM_REGISTRY }}
          RGO_NPM_TOKEN: ${{ secrets.RGO_NPM_TOKEN }}
        run: |
          if [ -z "$RGO_NPM_REGISTRY" ]; then
            echo "Missing RGO_NPM_REGISTRY secret"
            exit 1
          fi

          if [ -z "$RGO_NPM_TOKEN" ]; then
            echo "Missing RGO_NPM_TOKEN secret"
            exit 1
          fi

          REGISTRY_HOST_PATH="${RGO_NPM_REGISTRY#https://}"
          REGISTRY_HOST_PATH="${REGISTRY_HOST_PATH#http://}"
          REGISTRY_HOST_PATH="${REGISTRY_HOST_PATH%/}"

          cat > frontend/.npmrc <<EOF
          @rgo:registry=${RGO_NPM_REGISTRY}
          //${REGISTRY_HOST_PATH}/:_authToken=${RGO_NPM_TOKEN}
          always-auth=true
          EOF

      - name: Build frontend
        if: steps.changes.outputs.frontend_changed == 'true'
        shell: bash
        run: |
          cd frontend

          if [ -f package-lock.json ]; then
            npm ci
            npm run build
          elif [ -f pnpm-lock.yaml ]; then
            corepack enable
            pnpm install --frozen-lockfile
            pnpm build
          elif [ -f yarn.lock ]; then
            corepack enable
            yarn install --frozen-lockfile
            yarn build
          else
            npm install
            npm run build
          fi

      - name: Deploy frontend
        if: steps.changes.outputs.frontend_changed == 'true'
        shell: bash
        run: |
          rsync -av --delete frontend/dist/ /opt/apps/starter/frontend/

      - name: Build backend
        if: steps.changes.outputs.backend_changed == 'true'
        shell: bash
        run: |
          chmod +x ./gradlew
          ./gradlew clean bootJar

      - name: Deploy backend
        if: steps.changes.outputs.backend_changed == 'true'
        shell: bash
        run: |
          JAR_FILE="$(find build/libs -maxdepth 1 -type f -name '*.jar' ! -name '*plain*' | head -n 1)"

          if [ -z "$JAR_FILE" ]; then
            echo "No executable Spring Boot JAR found in build/libs"
            exit 1
          fi

          echo "Deploying JAR: $JAR_FILE"

          cp "$JAR_FILE" /opt/apps/starter/starter.jar
          sudo -n /usr/bin/systemctl restart starter.service
          /usr/bin/systemctl status starter.service --no-pager

      - name: Nothing to deploy
        if: steps.changes.outputs.frontend_changed != 'true' && steps.changes.outputs.backend_changed != 'true'
        run: |
          echo "No frontend or backend deployment-relevant files changed."
```

Note:

`actions/checkout@v4` caused a Node.js 20 deprecation warning.

Fix:

```yaml
uses: actions/checkout@v5
```

---

# 15. Deployment Tests Performed

## 16.1 Frontend-only deployment

Change file under:

```txt
frontend/src/
```

Commit and push:

```bash
git add frontend
git commit -m "Test frontend-only deployment"
git push origin main
```

Expected workflow:

```txt
frontend_changed=true
backend_changed=false

Build frontend ✅
Deploy frontend ✅

Build backend skipped ✅
Deploy backend skipped ✅
starter.service not restarted ✅
```

This succeeded.

## 16.2 Backend-only deployment

Change file under:

```txt
src/
```

Commit and push:

```bash
git add src
git commit -m "Test backend deployment"
git push origin main
```

Expected workflow:

```txt
frontend_changed=false
backend_changed=true

Build frontend skipped ✅
Deploy frontend skipped ✅

Build backend ✅
Deploy backend ✅
starter.service restarted ✅
```

This succeeded after fixing Gradle frontend coupling and sudoers.

## 16.3 Full-stack deployment

Change files under both:

```txt
frontend/src/
src/
```

Commit and push:

```bash
git add frontend src
git commit -m "Test full-stack deployment"
git push origin main
```

Expected workflow:

```txt
frontend_changed=true
backend_changed=true

Build frontend ✅
Deploy frontend ✅

Build backend ✅
Deploy backend ✅
starter.service restarted once ✅
```

This succeeded.

---

# 16. Manual Redeploy Commands

## 17.1 Manual frontend redeploy

From local machine, repo root:

```bash
cd ~/Desktop/private/java/starter/frontend
npm install
npm run build

cd ~/Desktop/private/java/starter
rsync -avz --delete frontend/dist/ deploy@46.224.72.162:/opt/apps/starter/frontend/
```

No backend restart needed.

## 17.2 Manual backend redeploy

From local machine, repo root:

```bash
cd ~/Desktop/private/java/starter
./gradlew clean bootJar
scp build/libs/starter-0.0.1-SNAPSHOT.jar deploy@46.224.72.162:/opt/apps/starter/starter.jar
ssh deploy@46.224.72.162 "sudo systemctl restart starter && sudo systemctl status starter --no-pager"
```

## 17.3 Manual full-stack redeploy

From local machine, repo root:

```bash
cd ~/Desktop/private/java/starter/frontend
npm install
npm run build

cd ~/Desktop/private/java/starter
rsync -avz --delete frontend/dist/ deploy@46.224.72.162:/opt/apps/starter/frontend/

./gradlew clean bootJar
scp build/libs/starter-0.0.1-SNAPSHOT.jar deploy@46.224.72.162:/opt/apps/starter/starter.jar
ssh deploy@46.224.72.162 "sudo systemctl restart starter && sudo systemctl status starter --no-pager"
```

---

# 17. Useful Production Commands

## 18.1 Check services

```bash
ssh deploy@46.224.72.162

sudo systemctl status starter --no-pager
sudo systemctl status caddy --no-pager
docker ps
```

Expected:

```txt
starter.service → active/running
caddy.service → active/running
starter-postgres → Up
```

## 18.2 Restart backend

```bash
sudo systemctl restart starter
sudo systemctl status starter --no-pager
```

## 18.3 View backend logs

```bash
sudo journalctl -u starter --no-pager -n 100
```

Follow logs live:

```bash
sudo journalctl -u starter -f
```

## 18.4 View Caddy logs

```bash
sudo journalctl -u caddy --no-pager -n 100
```

Follow logs live:

```bash
sudo journalctl -u caddy -f
```

## 18.5 View Postgres logs

```bash
docker logs starter-postgres
```

Follow logs live:

```bash
docker logs -f starter-postgres
```

## 18.6 Enter Postgres

```bash
docker exec -it starter-postgres psql -U starter_user -d starter
```

## 18.7 Check ports

```bash
ss -tulpn
```

Expected relevant bindings:

```txt
Caddy:       0.0.0.0:80 and 0.0.0.0:443
Spring Boot: 127.0.0.1:8081
Postgres:    127.0.0.1:5432
```

Postgres should not be publicly exposed.

---

# 18. Database Backup and Restore

## 19.1 Create backup

On VPS:

```bash
mkdir -p /opt/apps/starter/backups

docker exec starter-postgres pg_dump -U starter_user -d starter > /opt/apps/starter/backups/starter_$(date +%Y-%m-%d_%H-%M-%S).sql
```

List backups:

```bash
ls -lh /opt/apps/starter/backups
```

## 19.2 Copy backup to local machine

From local machine:

```bash
scp deploy@46.224.72.162:/opt/apps/starter/backups/<backup-file>.sql .
```

## 19.3 Restore backup

Be careful: this overwrites/restores database contents depending on the SQL dump content.

On VPS:

```bash
cat /opt/apps/starter/backups/<backup-file>.sql | docker exec -i starter-postgres psql -U starter_user -d starter
```

Recommended future improvement:

Automate daily database backups and copy them off-server.

---

# 19. Security Notes

## 20.1 Network exposure

Current desired exposure:

```txt
Public:
  80/tcp  → Caddy HTTP
  443/tcp → Caddy HTTPS

Private/local only:
  8081/tcp → Spring Boot on 127.0.0.1
  5432/tcp → Postgres on 127.0.0.1
```

Postgres is bound only to:

```txt
127.0.0.1:5432
```

This is good.

## 20.2 `.env` permissions

The production `.env` file should be readable only by `deploy`:

```bash
chmod 600 /opt/apps/starter/.env
```

## 20.3 GitHub secrets

Private npm token is stored in GitHub Actions secrets:

```txt
RGO_NPM_REGISTRY
RGO_NPM_TOKEN
```

Do not commit `.npmrc` with real token.

## 20.4 Sudoers scope

The `deploy` user is allowed to restart only this service:

```txt
starter.service
```

This is safer than giving broad passwordless sudo.

## 20.5 SSH access

The Hetzner firewall was configured so SSH is restricted to Bruno’s IP.

Because of that, the deployment uses a self-hosted GitHub Actions runner instead of GitHub-hosted runners.

---

# 20. Troubleshooting

## 21.1 Browser shows `DNS_PROBE_FINISHED_NXDOMAIN`

Meaning:

```txt
Local/browser/router/ISP DNS does not yet resolve starter.brunotot.com.
```

Verify public DNS:

```bash
dig @1.1.1.1 starter.brunotot.com A +short
dig @8.8.8.8 starter.brunotot.com A +short
dig @ns1.your-server.de starter.brunotot.com A +short
```

If those return:

```txt
46.224.72.162
```

then DNS is globally correct.

Flush local cache:

```bash
sudo resolvectl flush-caches
sudo systemctl restart systemd-resolved
```

Bypass DNS:

```bash
curl -I --resolve starter.brunotot.com:443:46.224.72.162 https://starter.brunotot.com
```

## 21.2 Postgres container keeps restarting

Check logs:

```bash
docker logs starter-postgres
```

If using `postgres:18`, make sure the volume is mounted to:

```txt
/var/lib/postgresql
```

not:

```txt
/var/lib/postgresql/data
```

Correct:

```yaml
volumes:
  - starter_postgres_data:/var/lib/postgresql
```

## 21.3 GitHub Actions npm install fails with `E401`

Meaning:

```txt
Missing or invalid private npm registry credentials.
```

Fix:

Check GitHub Actions secrets:

```txt
RGO_NPM_REGISTRY
RGO_NPM_TOKEN
```

Make sure `RGO_NPM_REGISTRY` matches local `.npmrc`.

## 21.4 GitHub Actions shows Node.js 20 deprecation warning

Cause:

```yaml
uses: actions/checkout@v4
```

Fix:

```yaml
uses: actions/checkout@v5
```

## 21.5 Backend deploy fails with `sudo: interactive authentication is required`

Cause:

The sudoers rule does not exactly match the command used by GitHub Actions.

Fix sudoers:

```bash
sudo nano /etc/sudoers.d/starter-deploy
```

Content:

```sudoers
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart starter.service, /usr/bin/systemctl restart starter, /bin/systemctl restart starter.service, /bin/systemctl restart starter
```

Validate:

```bash
sudo visudo -cf /etc/sudoers.d/starter-deploy
```

Workflow should use:

```bash
sudo -n /usr/bin/systemctl restart starter.service
```

---

# 21. Future Maintenance Notes

## 22.1 Updating the app

Normal workflow:

```txt
Make code changes
Commit
Push to main
GitHub Actions deploys automatically
```

No manual deployment should be needed in normal use.

## 22.2 Updating frontend dependencies

Local:

```bash
cd frontend
npm update
npm run build
```

Then commit updated files:

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "Update frontend dependencies"
git push origin main
```

## 22.3 Updating backend dependencies

Local:

```bash
./gradlew dependencyUpdates
```

If the dependency update plugin is not installed, inspect manually.

After changes:

```bash
./gradlew clean bootJar
git add build.gradle gradle.properties settings.gradle gradle
git commit -m "Update backend dependencies"
git push origin main
```

## 22.4 Updating GitHub runner

On VPS:

```bash
cd /opt/actions-runner/starter
sudo ./svc.sh stop
```

Follow GitHub’s current runner update instructions if manual update is needed.

Then:

```bash
sudo ./svc.sh start
sudo ./svc.sh status
```

## 22.5 Updating Node.js on VPS

On VPS:

```bash
node -v
npm -v
```

To upgrade NodeSource Node.js later:

```bash
sudo apt update
sudo apt upgrade -y nodejs
```

## 22.6 Updating Java on VPS

On VPS:

```bash
java -version
javac -version
```

Upgrade packages:

```bash
sudo apt update
sudo apt upgrade -y
```

## 22.7 Reboot VPS safely

```bash
sudo reboot
```

After reconnecting:

```bash
ssh deploy@46.224.72.162

sudo systemctl status starter --no-pager
sudo systemctl status caddy --no-pager
docker ps
```

Expected:

```txt
starter.service active/running
caddy active/running
starter-postgres Up
```

---

# 22. Removing the App Later

To remove `starter.brunotot.com` deployment:

## 23.1 Stop backend service

```bash
sudo systemctl stop starter
sudo systemctl disable starter
sudo rm /etc/systemd/system/starter.service
sudo systemctl daemon-reload
```

## 23.2 Stop and remove Postgres

Warning: this deletes the database volume if `-v` is used.

```bash
cd /opt/apps/starter
docker compose down -v
```

## 23.3 Remove app files

```bash
sudo rm -rf /opt/apps/starter
```

## 23.4 Remove Caddy block

Edit:

```bash
sudo nano /etc/caddy/Caddyfile
```

Remove:

```caddyfile
starter.brunotot.com {
    ...
}
```

Validate and reload:

```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 23.5 Remove DNS record

In Hetzner konsoleH DNS zone for `brunotot.com`, remove:

```txt
A starter → 46.224.72.162
```

## 23.6 Remove GitHub runner

In GitHub:

```txt
Repository → Settings → Actions → Runners
```

Remove the runner.

On VPS:

```bash
cd /opt/actions-runner/starter
sudo ./svc.sh stop
sudo ./svc.sh uninstall
./config.sh remove --token <REMOVE_TOKEN_FROM_GITHUB>
```

Then:

```bash
sudo rm -rf /opt/actions-runner/starter
```

---

# 23. Final Status

The deployment is complete.

Working production URL:

```txt
https://starter.brunotot.com
```

Working production services:

```txt
Caddy HTTPS reverse proxy ✅
React frontend static hosting ✅
Spring Boot backend systemd service ✅
PostgreSQL Docker container ✅
GitHub Actions self-hosted runner ✅
Frontend-only deploy without backend restart ✅
Backend deploy with service restart ✅
Full-stack deploy ✅
Private @rgo npm registry in CI ✅
```

Final architecture is ready to be reused for future Spring Boot + React apps.
