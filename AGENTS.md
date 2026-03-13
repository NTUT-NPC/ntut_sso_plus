# NTUT SSO PLUS

This document provides essential context and technical guidelines for AI coding assistants working on the **NTUT SSO+** project.

Follow @CONTRIBUTING.md for git operation guidelines.

Last updated: 2026-03-13. If stale (>7 days), verify Status section against codebase.

## 🚀 Project Overview
**NTUT SSO+** is a browser extension built with [WXT](https://wxt.dev/) and Vue 3. It simplifies the login process for Taipei Tech (NTUT) students and provides additional utilities like course material downloads.

## 🛠 Tech Stack
- **Framework:** [WXT](https://wxt.dev/) (Web Extension Toolbox)
- **Frontend:** [Vue 3](https://vuejs.org/) (SFC with `<script setup>`)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** Vanilla CSS (stored in `.css` files and Vue `<style scoped>` blocks)

## 📁 Project Structure
- `entrypoints/`: Main entrypoints for the extension.
    - `background.ts`: Service worker handling background tasks (e.g., downloads).
    - `*.content.ts`: Content scripts injected into specific domains (defined in `wxt.config.ts` matches).
    - `popup/`: The extension popup UI.
        - `App.vue`: Root component.
        - `components/`: Reusable Vue components (e.g., `Login.vue`, `MainView.vue`).
- `public/`: Static assets like icons.
- `wxt.config.ts`: Configuration for permissions, host permissions, and manifest details.

## 📏 Coding Standards

### General
- **Indentation:** 
  - 4 spaces for `.ts` and `.js` files.
  - 2 spaces for `.vue`, `.html`, and `.css` files.
- **Semicolons:** Required.
- **Quotes:** Use single quotes (`'`) for strings in TypeScript/JavaScript.

### Naming Conventions
- **Files:**
  - Vue components: `PascalCase.vue` (e.g., `MainView.vue`).
  - TypeScript util scripts: `camelCase.ts` or `kebab-case.ts`.
  - WXT Content Scripts: Must end with `.content.ts`.
- **Code:**
  - Variables/Functions: `camelCase`.
  - Constants: `SCREAMING_SNAKE_CASE`.
  - Types/Interfaces: `PascalCase`.

### Vue Patterns
- Always use `<script setup lang="ts">`.
- Use CSS variables for styling to maintain theme consistency (see `entrypoints/popup/style.css`).

## 🔌 Architecture Notes
- **Communication:** Content scripts and the popup communicate with the background script using `browser.runtime.sendMessage`.
- **Storage:** Use `browser.storage.local` for persisting user credentials and settings.
- **Authentication:** SSO logic is centralized in `entrypoints/popup/sso.ts`.

## 📦 Versioning
The project follows a `year.month.version` versioning scheme (e.g., `26.3.19`).
- **Year:** Last two digits of the year (e.g., `26` for 2026).
- **Month:** Current month without leading zero.
- **Version:** Incremental patch number.

## 🛠 Common Commands
- `npm run dev`: Start development mode with hot reload for Chrome (manifest v3).
- `npm run dev:firefox`: Start development mode with hot reload for Firefox (manifest v2). 
- `npm run build`: Build for production (manifest v3).
- `npm run build:firefox`: Build for production (manifest v2).
- `npm run zip`: Package the extension for Chrome (manifest v3).
- `npm run zip:firefox`: Package the extension for Firefox (manifest v2).