# Environment setup

## macOS/Linux

### Install [NVM](https://nodejs.org/en/download)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

bash
```

### Install Node 24 and dependencies

```bash
nvm install 24
nvm use 24
npm i
```

## Windows

### Install [Node 24](https://nodejs.org/en/download)

> https://nodejs.org/dist/v24.14.0/node-v24.14.0-x64.msi

### Install dependencies
```bash
npm i
```

# Contributing

1. Fork and clone the repository.

2. Create a new feature branch.
    ```bash
    git checkout -b feat/your-feature
    ```

3. Make your changes and commit them.
    ```bash
    git commit -m 'feat: add some feature'
    ```

4. Push to the branch.
    ```bash
    git push origin feat/your-feature
    ```

5. Open a Pull Request.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>[optional scope]: <description>
```

**Types:**

- `feat` — end-user visible new functionality or behavior change, including performance improvements
- `fix` — end-user visible bug fixes
- `refactor` — restructuring code without changing behavior
- `chore` — dependency updates, config changes, i18n strings, other maintenance
- `ci` — GitHub Actions workflows and Fastlane
- `test` — adding or updating tests
- `docs` — documentation only

**Scopes (optional):** use `chrome` or `firefox` when the change is platform-specific.

**Examples:**

- `feat: add student query service`
- `fix(chrome): resolve storage permission issue`
- `docs: update README.md`

## Branch Names

Use kebab-case: `feat/add-student-query-service`, `fix/storage-permission-issue`

## Versioning

The project follows a `year.month.patch` versioning scheme (e.g., `26.3.4`).

### How to Update Version

1. **Source of Truth**: The version is managed in `package.json`. Files like `wxt.config.ts` and GitHub Actions automatically read the version from `package.json`.
2. **Automated Bumping**: Use the **Update Version** GitHub Action to update the version:
   - Go to the **Actions** tab in GitHub.
   - Select the **Update Version** workflow.
   - Click **Run workflow**. 
   - You can optionally specify a version number, or leave it empty to automatically increment the patch number (or reset to 1 if the month has changed).
   - The action will create a Pull Request with the version update. Merge it to apply the changes to `main`.
3. **Unmerged PRs**: Do **not** update the version number in regular feature or fix PRs. Version bumping should be done separately (via the GitHub Action) only when preparing for a release.

### Manual Update (Local)

If you must update the version manually:
```bash
npm version <new-version> --no-git-tag-version
```
This will update both `package.json` and `package-lock.json`.

