# Fuel Dash — Appwrite + Next.js

A personal dashboard for tracking fuel receipts and costs.  
**Stack:** Next.js (App Router), Appwrite Cloud (Auth, Storage, Databases, Functions, Sites), OpenAI (vision parsing), shadcn/ui, Recharts.

---

## Features

- 📤 **Multi-image upload** (receipts) to Appwrite Storage
- ⚙️ Appwrite **Function** auto-parses receipts (OpenAI), writes structured logs
- 📊 Dashboard: **price/L over time**, **spend by month/year**, summary cards
- 🔐 Only **pre-created Appwrite users** can sign in
- 🧩 Monorepo-friendly: Next.js site + Functions in one repository
- 🚀 Git-based auto deploys
  - Appwrite **Function** (from Git)
  - **Next.js** on **Appwrite Sites** (from Git)

---

## Monorepo Layout (this repo)

This README matches your current layout and uses Git deploys without tarballs.

```
repo-root/
├─ Upright/
│  └─ functions/
│     └─ extract-fuel-data/        # Appwrite Function (Git-deployed)
│        ├─ package.json
│        └─ src/
│           └─ main.js             # Entrypoint for the function
├─ src/
│  └─ app/                         # Next.js app (App Router)
│     ├─ page.tsx
│     ├─ dashboard/
│     └─ ... components, api, etc.
├─ public/
├─ package.json
├─ README.md
└─ .gitignore
```

> You can keep this exact structure. Appwrite lets you set a **root directory per product**:
> - **Function** root: `Upright/functions/extract-fuel-data` (entrypoint: `src/main.js`)
> - **Site** root: repository root (since your Next.js lives at repo root)

If you later prefer a cleaner monorepo, consider:
```
repo-root/
├─ apps/
│  └─ web/                      # Next.js site
└─ functions/
   └─ extract-fuel-data/        # Appwrite Function
```
(Then set **Site Root** = `apps/web`, **Function Root** = `functions/extract-fuel-data`.)

---

## Local Development

```bash
pnpm install
pnpm dev      # Next.js at http://localhost:3000
```

Create **.env.local** at the repo root (or at apps/web if you move the site later), and fill with values below.

---

## Environment Variables

### Next.js (site)

Create **.env.local** in the **site root** (here: repo root):

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=...
NEXT_PUBLIC_APPWRITE_PROJECT_ID=...
NEXT_PUBLIC_DB_ID=...
NEXT_PUBLIC_CARS_ID=...
NEXT_PUBLIC_FUELLOGS_ID=...
NEXT_PUBLIC_RECEIPTS_BUCKET=...

# Server-only (used by /api routes):
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
```

> In **Appwrite → Sites → [Your Site] → Settings → Variables**, mirror these for production.

### Function (extract-fuel-data)

Use **Appwrite → Functions → [extract-fuel-data] → Settings → Variables** to add:

```
DB_ID=...
COLLECTION_ID=...
BUCKET_ID=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
```

---

## Connecting Git Deploys (Appwrite Cloud)

### 1) Function (Git)

1. Appwrite Console → **Functions** → create/select **extract-fuel-data**.  
2. **Git settings** → **Connect repository** → select this repo + branch.  
3. **Root directory:** `Upright/functions/extract-fuel-data`  
4. **Entrypoint:** `src/main.js`  
5. Save. Push to the configured branch to build and (if configured) auto-activate the new deployment.

> For manual uploads (not needed here), you would upload a `code.tar.gz`, but Git deploys never require a tarball.

### 2) Site (Next.js on Appwrite Sites)

1. Appwrite Console → **Sites** → **Create site** → **Connect repository**.  
2. Choose this repo + branch.  
3. **Root directory:** repo root (empty field) since your Next.js is at the top level.  
4. Framework: **Next.js**.  
5. Build settings (default are fine):
   - Install: `npm install` (or `pnpm i`)
   - Build: `npm run build` (or `pnpm build`)
   - Output: `./.next`
6. Add the required **Site Variables** (same names as .env).  
7. Deploy. Subsequent pushes to the branch will auto-create and activate a new deployment.

---

## Events & Permissions (Function)

- **Trigger**: set file-create event for your receipts bucket, e.g.  
  `buckets.{YOUR_BUCKET_ID}.files.*.create`  
- **File permissions**: when uploading from the site, set `Permission.read(Role.users())` so the client app can preview.  
- **Document permissions**: when the function writes FuelLogs, add `Permission.read(Role.users())` (and `update` if you want editing).

---

## What NOT to Commit (sensitive / generated)

Add (or keep) these in `.gitignore`:

```
# env & secrets
.env
*.env
*.env.local
**/.env
**/.env.local

# Appwrite descriptors (if you export secrets — avoid committing)
appwrite.json

# builds & caches
.next/
out/
dist/
node_modules/
*.log

# OS/IDE
.DS_Store
Thumbs.db
.vscode/*
!.vscode/extensions.json
```

---

## License

MIT