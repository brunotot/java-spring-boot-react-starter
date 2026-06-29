# MINIMAL VPS DEPLOYMENT GUIDE

## Table of Contents

- [Assumptions](#assumptions)
- [Estimated Time](#estimated-time)
- [Deployment Steps](#deployment-steps)
- [Final Checks](#final-checks)
- [Common Commands](#common-commands)

---

## Assumptions

- VPS already exists.
- Domain already exists and DNS is managed in Hetzner/konsoleH.
- SSH access to the VPS works.
- `deploy` Linux user exists.
- Firewall allows HTTP `80`, HTTPS `443`, and SSH `22`.
- App uses Spring Boot backend + React/Vite frontend.
- React app is in `frontend/`.
- Backend API is served under `/api/*`.
- PostgreSQL is used as production database.
- GitHub repository already exists.
- GitHub Actions self-hosted runner will run on the VPS.

---

## Estimated Time

```txt
Repeat deployment with this starter template: 1–2 hours
First careful deployment with this starter template: 2–3 hours
With DNS/private registry/CI troubleshooting: 3–5 hours
```

---

## Deployment Steps

## Step 1 — Create DNS Record

`Hetzner - konsoleH dashboard`

- **1.1**: Open `Networking → DNS`
- **1.2**: Open the domain DNS zone
- **1.3**: Add new DNS record

```txt
Type:  A
Name:  ${APP_NAME}
Value: ${VPS_IP}
TTL:   7200
```

- **1.4**: Verify the record

```bash
dig @1.1.1.1 ${APP_DOMAIN} A +short
```

- **1.5**: Should output

```txt
${VPS_IP}
```

---

## Step 2 — Connect to VPS

`Local machine`

- **2.1**: Connect to the VPS

```bash
ssh ${VPS_DEPLOY_USER}@${VPS_IP}
```

- **2.2**: Should open a VPS shell as `${VPS_DEPLOY_USER}`

---

## Step 3 — Create App Folders

`VPS`

- **3.1**: Create app folders

```bash
sudo mkdir -p ${VPS_FRONTEND_DIR}
sudo chown -R ${VPS_DEPLOY_USER}:${VPS_DEPLOY_USER} ${VPS_APP_DIR}
```

- **3.2**: Verify app folder

```bash
ls -la ${VPS_APP_DIR}
```

- **3.3**: Should include

```txt
frontend
```

---

## Step 4 — Install Runtime Packages

`VPS`

- **4.1**: Install Java, Docker, and Docker Compose

```bash
sudo apt update
sudo apt install -y openjdk-21-jre-headless docker.io docker-compose-v2
```

- **4.2**: Add `${VPS_DEPLOY_USER}` to the Docker group

```bash
sudo usermod -aG docker ${VPS_DEPLOY_USER}
exit
```

- **4.3**: Reconnect to the VPS

```bash
ssh ${VPS_DEPLOY_USER}@${VPS_IP}
```

- **4.4**: Verify installed tools

```bash
java -version
docker --version
docker compose version
```

---

## Step 5 — Create Production Environment File

`VPS`

- **5.1**: Create environment file

```bash
nano ${VPS_ENV_PATH}
```

- **5.2**: Add environment variables

```env
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=${APP_BACKEND_PORT}

SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/${DB_NAME}
SPRING_DATASOURCE_USERNAME=${DB_USER}
SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
```

- **5.3**: Protect environment file

```bash
chmod 600 ${VPS_ENV_PATH}
```

- **5.4**: Verify permissions

```bash
ls -la ${VPS_ENV_PATH}
```

- **5.5**: Should output permissions similar to

```txt
-rw------- ${VPS_DEPLOY_USER} ${VPS_DEPLOY_USER}
```

---

## Step 6 — Create PostgreSQL Docker Compose

`VPS`

- **6.1**: Create Docker Compose file

```bash
nano ${VPS_APP_DIR}/docker-compose.yml
```

- **6.2**: Add PostgreSQL service

```yaml
services:
  postgres:
    image: postgres:18
    container_name: ${DB_CONTAINER}
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: "${DB_PASSWORD}"
    volumes:
      - ${DB_VOLUME}:/var/lib/postgresql
    ports:
      - "127.0.0.1:5432:5432"

volumes:
  ${DB_VOLUME}:
```

- **6.3**: Verify file exists

```bash
ls -la ${VPS_APP_DIR}/docker-compose.yml
```

---

## Step 7 — Start PostgreSQL

`VPS`

- **7.1**: Start PostgreSQL

```bash
cd ${VPS_APP_DIR}
docker compose up -d postgres
```

- **7.2**: Check container

```bash
docker ps
```

- **7.3**: Check logs

```bash
docker logs ${DB_CONTAINER}
```

- **7.4**: Should include

```txt
database system is ready to accept connections
```

---

## Step 8 — Test PostgreSQL

`VPS`

- **8.1**: Open PostgreSQL shell

```bash
docker exec -it ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}
```

- **8.2**: Run test query

```sql
SELECT current_database(), current_user;
```

- **8.3**: Should output

```txt
${DB_NAME} | ${DB_USER}
```

- **8.4**: Exit PostgreSQL shell

```sql
\q
```

---

## Step 9 — Build Backend Locally

`Local machine`

- **9.1**: Go to repository root

```bash
cd ${LOCAL_REPO_ROOT}
```

- **9.2**: Build backend JAR

```bash
./gradlew clean bootJar
```

- **9.3**: Verify JAR exists

```bash
ls -la build/libs
```

- **9.4**: Should include

```txt
${VPS_JAR_FILE}
```

---

## Step 10 — Upload Backend JAR

`Local machine`

- **10.1**: Upload JAR to VPS

```bash
cd ${LOCAL_REPO_ROOT}
scp build/libs/${VPS_JAR_FILE} ${VPS_DEPLOY_USER}@${VPS_IP}:${VPS_JAR_PATH}
```

- **10.2**: Verify uploaded JAR

```bash
ssh ${VPS_DEPLOY_USER}@${VPS_IP} "ls -la ${VPS_JAR_PATH}"
```

- **10.3**: Should output

```txt
${VPS_JAR_PATH}
```

---

## Step 11 — Create Systemd Service

`VPS`

- **11.1**: Create service file

```bash
sudo nano /etc/systemd/system/${VPS_SYSTEMD_SERVICE}
```

- **11.2**: Add service configuration

```ini
[Unit]
Description=${APP_NAME} Spring Boot App
After=network.target docker.service
Requires=docker.service

[Service]
User=${VPS_DEPLOY_USER}
WorkingDirectory=${VPS_APP_DIR}
EnvironmentFile=${VPS_ENV_PATH}
ExecStart=/usr/bin/java -jar ${VPS_JAR_PATH}
Restart=always
RestartSec=10
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

- **11.3**: Enable and start service

```bash
sudo systemctl daemon-reload
sudo systemctl enable ${VPS_SYSTEMD_SERVICE}
sudo systemctl start ${VPS_SYSTEMD_SERVICE}
```

- **11.4**: Check service status

```bash
sudo systemctl status ${VPS_SYSTEMD_SERVICE} --no-pager
```

- **11.5**: Should include

```txt
Active: active (running)
```

---

## Step 12 — Test Backend Locally on VPS

`VPS`

- **12.1**: Send local backend request

```bash
curl -I http://127.0.0.1:${APP_BACKEND_PORT}
```

- **12.2**: Should output a valid HTTP response, for example

```txt
HTTP/1.1 200
```

---

## Step 13 — Build Frontend Locally

`Local machine`

- **13.1**: Go to frontend folder

```bash
cd ${LOCAL_REPO_ROOT}/frontend
```

- **13.2**: Install dependencies and build

```bash
npm ci
npm run build
```

- **13.3**: Verify build output

```bash
ls -la dist
```

- **13.4**: Should include

```txt
index.html
assets
```

---

## Step 14 — Upload Frontend Static Files

`Local machine`

- **14.1**: Upload frontend build to VPS

```bash
cd ${LOCAL_REPO_ROOT}
rsync -avz --delete frontend/dist/ ${VPS_DEPLOY_USER}@${VPS_IP}:${VPS_FRONTEND_DIR}/
```

- **14.2**: Verify uploaded files

```bash
ssh ${VPS_DEPLOY_USER}@${VPS_IP} "ls -la ${VPS_FRONTEND_DIR}"
```

- **14.3**: Should include

```txt
index.html
assets
```

---

## Step 15 — Configure Caddy

`VPS`

- **15.1**: Open Caddy config

```bash
sudo nano /etc/caddy/Caddyfile
```

- **15.2**: Add site block

```caddyfile
${APP_DOMAIN} {
    handle /api/* {
        reverse_proxy 127.0.0.1:${APP_BACKEND_PORT}
    }

    handle {
        root * ${VPS_FRONTEND_DIR}
        try_files {path} /index.html
        file_server
    }
}
```

- **15.3**: Format, validate, and reload Caddy

```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

- **15.4**: Should complete without errors

---

## Step 16 — Verify HTTPS

`Local machine`

- **16.1**: Send HTTPS request

```bash
curl -I https://${APP_DOMAIN}
```

- **16.2**: Should output

```txt
HTTP/2 200
```

---

## Step 17 — Install GitHub Runner

`Local machine`

- **17.1**: Open GitHub repository in browser
- **17.2**: Open `Settings → Actions → Runners → New self-hosted runner`
- **17.3**: Select `Linux` and `x64`

`VPS`

- **17.4**: Create runner folder

```bash
sudo mkdir -p ${RUNNER_DIR}
sudo chown -R ${VPS_DEPLOY_USER}:${VPS_DEPLOY_USER} ${RUNNER_DIR}
cd ${RUNNER_DIR}
```

- **17.5**: Run the download and config commands shown by GitHub
- **17.6**: Use these runner settings

```txt
Runner group: press Enter for Default
Runner name:  ${RUNNER_NAME}
Labels:       ${RUNNER_LABEL}
Work folder:  press Enter for _work
```

- **17.7**: Should output successful runner configuration

---

## Step 18 — Install Runner as Service

`VPS`

- **18.1**: Install and start runner service

```bash
cd ${RUNNER_DIR}
sudo ./svc.sh install ${VPS_DEPLOY_USER}
sudo ./svc.sh start
sudo ./svc.sh status
```

- **18.2**: Should show runner service as running

`Local machine`

- **18.3**: In GitHub repository, open `Settings → Actions → Runners`
- **18.4**: Should show runner as `Idle`

---

## Step 19 — Install Build Tools for Runner

`VPS`

- **19.1**: Install Java JDK and utilities

```bash
sudo apt update
sudo apt install -y openjdk-21-jdk-headless curl ca-certificates gnupg rsync
```

- **19.2**: Install Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
sudo apt install -y nodejs
```

- **19.3**: Verify tools

```bash
java -version
javac -version
node -v
npm -v
rsync --version | head -n 1
```

- **19.4**: Should show Java 21, Node 22, npm, and rsync

---

## Step 20 — Allow Backend Restart From CI

`VPS`

- **20.1**: Create sudoers file

```bash
sudo nano /etc/sudoers.d/${APP_NAME}-deploy
```

- **20.2**: Add permission

```sudoers
${VPS_DEPLOY_USER} ALL=(root) NOPASSWD: /usr/bin/systemctl restart ${VPS_SYSTEMD_SERVICE}, /usr/bin/systemctl restart ${APP_NAME}, /bin/systemctl restart ${VPS_SYSTEMD_SERVICE}, /bin/systemctl restart ${APP_NAME}
```

- **20.3**: Validate sudoers file

```bash
sudo chmod 440 /etc/sudoers.d/${APP_NAME}-deploy
sudo visudo -cf /etc/sudoers.d/${APP_NAME}-deploy
```

- **20.4**: Test passwordless restart

```bash
sudo -k
sudo -n /usr/bin/systemctl restart ${VPS_SYSTEMD_SERVICE}
/usr/bin/systemctl status ${VPS_SYSTEMD_SERVICE} --no-pager
```

- **20.5**: Should restart without password prompt

---

## Step 21 — Add GitHub Secrets

`Local machine`

- **21.1**: Open GitHub repository in browser
- **21.2**: Open `Settings → Secrets and variables → Actions → New repository secret`
- **21.3**: Add private npm registry secrets if private packages are used

```txt
RGO_NPM_REGISTRY=https://your.registry.url/
RGO_NPM_TOKEN=your_token
```

- **21.4**: Should show secrets in repository Actions settings

---

## Step 22 — Verify Deployment Workflow

`Local machine`

- **22.1**: Verify workflow file exists

```bash
cd ${LOCAL_REPO_ROOT}
ls -la .github/workflows/deploy.yml
```

- **22.2**: Push to `main`

```bash
git status
git push origin main
```

- **22.3**: Open GitHub Actions
- **22.4**: Should show workflow run triggered by push

---

## Step 23 — Test Frontend-Only Deploy

`Local machine`

- **23.1**: Change a file under

```txt
frontend/src/
```

- **23.2**: Commit and push

```bash
cd ${LOCAL_REPO_ROOT}
git add frontend
git commit -m "Test frontend deployment"
git push origin main
```

- **23.3**: Should build and deploy frontend only
- **23.4**: Should skip backend build
- **23.5**: Should not restart `${VPS_SYSTEMD_SERVICE}`

---

## Step 24 — Test Backend-Only Deploy

`Local machine`

- **24.1**: Change a file under

```txt
src/
```

- **24.2**: Commit and push

```bash
cd ${LOCAL_REPO_ROOT}
git add src
git commit -m "Test backend deployment"
git push origin main
```

- **24.3**: Should build and deploy backend only
- **24.4**: Should skip frontend build
- **24.5**: Should restart `${VPS_SYSTEMD_SERVICE}`

---

## Step 25 — Test Full-Stack Deploy

`Local machine`

- **25.1**: Change files under both

```txt
frontend/src/
src/
```

- **25.2**: Commit and push

```bash
cd ${LOCAL_REPO_ROOT}
git add frontend src
git commit -m "Test full-stack deployment"
git push origin main
```

- **25.3**: Should build and deploy frontend
- **25.4**: Should build and deploy backend
- **25.5**: Should restart `${VPS_SYSTEMD_SERVICE}` once

---

## Final Checks

`VPS`

- **1**: Check services

```bash
sudo systemctl status ${VPS_SYSTEMD_SERVICE} --no-pager
sudo systemctl status caddy --no-pager
docker ps
```

- **2**: Should show

```txt
${VPS_SYSTEMD_SERVICE} active/running
caddy.service active/running
${DB_CONTAINER} Up
```

`Local machine`

- **3**: Check HTTPS

```bash
curl -I https://${APP_DOMAIN}
```

- **4**: Should output

```txt
HTTP/2 200
```

---

## Common Commands

Check backend logs:

```bash
sudo journalctl -u ${VPS_SYSTEMD_SERVICE} --no-pager -n 100
```

Follow backend logs:

```bash
sudo journalctl -u ${VPS_SYSTEMD_SERVICE} -f
```

Restart backend:

```bash
sudo systemctl restart ${VPS_SYSTEMD_SERVICE}
```

Check Caddy logs:

```bash
sudo journalctl -u caddy --no-pager -n 100
```

Check Postgres logs:

```bash
docker logs ${DB_CONTAINER}
```

Enter Postgres:

```bash
docker exec -it ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}
```

Create database backup:

```bash
mkdir -p ${VPS_APP_DIR}/backups
docker exec ${DB_CONTAINER} pg_dump -U ${DB_USER} -d ${DB_NAME} > ${VPS_APP_DIR}/backups/${DB_NAME}_$(date +%Y-%m-%d_%H-%M-%S).sql
```

Manual frontend deploy:

```bash
cd ${LOCAL_REPO_ROOT}/frontend
npm ci
npm run build

cd ${LOCAL_REPO_ROOT}
rsync -avz --delete frontend/dist/ ${VPS_DEPLOY_USER}@${VPS_IP}:${VPS_FRONTEND_DIR}/
```

Manual backend deploy:

```bash
cd ${LOCAL_REPO_ROOT}
./gradlew clean bootJar
scp build/libs/${VPS_JAR_FILE} ${VPS_DEPLOY_USER}@${VPS_IP}:${VPS_JAR_PATH}
ssh ${VPS_DEPLOY_USER}@${VPS_IP} "sudo systemctl restart ${VPS_SYSTEMD_SERVICE} && sudo systemctl status ${VPS_SYSTEMD_SERVICE} --no-pager"
```
