# 0: Make all scripts executable

```bash
chmod +x ./scripts/*.sh
```

# 1: Generate `variables.env` file

```bash
./scripts/create-local-variables-env.sh
```

# 2: Populate `variables.env` file with your project-specific values

```txt
This is a manual step. Open the `.local/variables.env` file and edit the values to match your project-specific configuration.
Be careful as this is the most important step in the local setup process. The values you provide here will be used to generate various configuration files and scripts for your project.
```

# 3: Run the local setup steps script

```bash
./scripts/run-local-setup-steps.sh
```
