# 0: Make all scripts executable

```bash
chmod +x ./scripts/*.sh
```

# 1: Generate `variables.env` file

```bash
./scripts/create-local-variables-env.sh
```

# 2: Populate `variables.env` file with your project-specific values

# 3: Generate `.vscode/settings.json` file

```bash
mkdir -p .vscode && ./scripts/substitute-vars.sh --vars-file=.local/variables.env --input-file=templates/vscode-settings.template.json --output-file=.vscode/settings.json
```

# 4: Generate `.vscode/launch.json` file

```bash
mkdir -p .vscode && ./scripts/substitute-vars.sh --vars-file=.local/variables.env --input-file=templates/vscode-launch.template.json --output-file=.vscode/launch.json
```

# 5: Generate `.local/DEPLOYMENT_GUIDE_MINIMAL.gen.md` file

```bash
./scripts/substitute-vars.sh --vars-file=.local/variables.env --input-file=templates/deployment-guide-minimal.template.md --output-file=.local/DEPLOYMENT_GUIDE_MINIMAL.gen.md
```

# 6: Generate `.github/workflows/deploy.yml` file

```bash
./scripts/substitute-vars.sh --vars-file=.local/variables.env --input-file=templates/deploy.template.yml --output-file=.github/workflows/deploy.yml --ignore-missing=true
```

# 7: Apply project-specific patches

```bash
./scripts/rename-backend-package.sh \
  --old-group="$(./scripts/get-local-variable.sh --key=LOCAL_REPO_OLD_GROUP_ID)" \
  --old-artifact="$(./scripts/get-local-variable.sh --key=LOCAL_REPO_OLD_ARTIFACT_ID)" \
  --new-group="$(./scripts/get-local-variable.sh --key=LOCAL_REPO_NEW_GROUP_ID)" \
  --new-artifact="$(./scripts/get-local-variable.sh --key=LOCAL_REPO_NEW_ARTIFACT_ID)"
```

# 8: Add, commit, and push changes to your local repository

```bash
git add . && git commit -m "Initial local setup" && git push
```
