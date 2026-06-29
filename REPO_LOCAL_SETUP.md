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
