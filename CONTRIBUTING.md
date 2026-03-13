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

