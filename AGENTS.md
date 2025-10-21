# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` hosts Next.js App Router routes, `dashboard/` pages, and API handlers under `api/`.
- `src/components/` collects reusable UI built on Radix and shadcn/ui.
- `src/lib/` stores data helpers and Appwrite clients; keep business logic here.
- `public/` serves static assets consumed by the dashboard.
- `appwrite/functions/extract-fuel-data/` holds the receipt parsing Function with its own `package.json` and `src/main.js`.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies for the Next.js app and Appwrite function workspaces.
- `pnpm dev` runs the web app locally with Turbopack at `http://localhost:3000`.
- `pnpm build` compiles a production build; run it before opening a PR to catch routing or typing regressions.
- `pnpm start` serves the production build locally.
- `pnpm lint` executes ESLint via `eslint.config.mjs`; add `--fix` to auto-apply safe fixes.

## Coding Style & Naming Conventions
Author features in TypeScript and prefer React Server Components unless interactivity is required. Follow ESLint guidance and the Tailwind setup in `tailwind.config.ts`. Keep indentation at two spaces; wrap long JSX attributes onto separate lines. Use PascalCase for components (`FuelChart.tsx`), camelCase for hooks and utilities, and SCREAMING_CASE for env constants. Avoid default exports for shared utilities so imports stay discoverable.

## Testing Guidelines
Automated tests are not yet configured. When introducing them, add Vitest + Testing Library and colocate files as `Component.test.tsx` alongside the component or under `src/__tests__/`. Cover `src/lib` helpers with focused unit tests and write smoke tests for pages. Until a harness exists, rely on `pnpm lint`, `pnpm build`, and manual dashboard flows (upload receipt, confirm charts render) before merging.

## Commit & Pull Request Guidelines
History uses conventional commit prefixes (`fix: …`, `feat: …`). Keep subjects under 72 characters and add bodies describing motivation or follow-ups. Each PR should provide: a concise summary of the change scope, screenshots or GIFs for UI adjustments, links to related Appwrite configuration changes, and the local verification checklist (`pnpm dev`, `pnpm lint`, `pnpm build`). Keep PRs scoped so reviewers can trace dashboard and function updates separately.

## Configuration & Secrets
Create `.env.local` at the repo root for site keys (`NEXT_PUBLIC_APPWRITE_ENDPOINT`, `OPENAI_API_KEY`, etc.) and do not commit it. Mirror the same names in the Appwrite console for production deployments. When adding new secrets or environment flags, update `README.md` and share rotation steps with maintainers; never log sensitive values in the dashboard or function runtime.
