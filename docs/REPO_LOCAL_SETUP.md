# Repository Local Setup

Use this guide after creating your own repository from the template via GitHub's **Use this template** action.

## Goal

Prepare a newly created repository so it is ready for local end-to-end development.

## Prerequisites

- Run all commands from the repository root.
- Ensure shell scripts can be executed in your environment.

## Setup Steps

### 1) Make scripts executable

```bash
chmod +x ./scripts/*.sh
```

### 2) Generate local variables file

```bash
./scripts/create-local-variables-env.sh
```

This generates `.local/variables.env` (if it does not already exist).

### 3) Fill project-specific values

Open `.local/variables.env` and update values for your project.

This is the most important step because these values are used to generate project configuration and automation files.

### 4) Run local setup workflow

```bash
./scripts/run-local-setup-steps.sh
```

## Verification

After setup completes:

- Confirm generated files are present and customized for your project.
- Build and run the application stack according to the repository README.

## Troubleshooting

- If a script fails due to permissions, re-run step 1.
- If generation output looks incorrect, re-check values in `.local/variables.env` and run step 4 again.
