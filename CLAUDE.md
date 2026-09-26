# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

UTSlovakia — not an e-commerce store, but a **product catalogue with a CMS**. Next.js 16 (App Router) frontend + Payload CMS 3 admin/API, backed by Postgres.

This repo has an `AGENTS.md` pointing to a Payload CMS reference skill at `.agents/skills/payload/` (`SKILL.md` + `reference/*.md`). Consult it for Payload patterns (collections, fields, hooks, access control, queries) rather than re-deriving them.

## Commands

```bash
pnpm dev              # start dev server (Next.js + Payload admin at /admin)
pnpm devsafe          # dev, but wipes .next first (use if HMR/build cache is stale)
pnpm build            # production build
pnpm start            # run production build

pnpm lint             # eslint (CI runs it with --max-warnings 0)
pnpm typecheck        # tsc --noEmit
pnpm migrate          # apply migrations (migrate:create <name>, migrate:status)

pnpm generate:types      # regenerate src/payload-types.ts from collection configs — run after ANY collection/field change
pnpm generate:importmap  # regenerate admin importMap after adding custom admin components

pnpm test             # runs test:int then test:e2e
pnpm test:int         # vitest (jsdom) — tests/int/**/*.int.spec.ts
pnpm test:e2e         # playwright — tests/e2e/**, auto-boots `pnpm dev` against http://localhost:3000

# single test examples
pnpm exec vitest run tests/int/seo.int.spec.ts
pnpm exec playwright test tests/e2e/frontend.e2e.spec.ts
```

Package manager is **pnpm** (see `pnpm-workspace.yaml`, `.npmrc`). Node `^18.20.2 || >=20.9.0`.

Formatting: Prettier, no semicolons, single quotes, `printWidth: 100` (`.prettierrc.json`).

## Environment

Required vars (see `.env.example` and README). Tests load `.env.test.local` before `.env`; e2e user seeding refuses to run against the `.env` database.

- `DATABASE_URL` — Postgres connection string (`@payloadcms/db-postgres`).
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SITE_URL` — public origin used for `metadataBase`, canonical/OG URLs, and JSON-LD (must be absolute).

## Architecture

### Two route groups sharing one Next.js app

- `src/app/(payload)/` — Payload's own admin UI (`/admin/[[...segments]]`) and REST/GraphQL API routes (`/api/[...slug]`, `/api/graphql`). Not localized.
- `src/app/[locale]/(frontend)/` — the public catalogue, localized via `next-intl`. Pages: home, `products`, `products/[slug]`, `category`, `category/[slug]`, `contact`.
- `src/proxy.ts` (Next 16's name for middleware) runs `next-intl`'s middleware for all paths except `api`, `admin`, static assets — so admin/API routes never get locale-prefixed or rewritten.

### Internationalization

- `src/i18n/routing.ts` defines locales (`pl` default, `en`, `sk`, `pt-br`), `localePrefix: 'as-needed'` (root locale has no prefix), and per-locale `pathnames` (e.g. `/products` → `/produkty` in Polish, `/produtos` in Portuguese). When adding a new frontend route, add its translated path here.
- `src/messages/{pl,en,sk,pt-br}.json` hold UI strings for `next-intl`.
- Payload's own `i18n` (admin UI language) is configured separately in `payload.config.ts` (`pl` translations, `pl` fallback) — distinct from Payload's `localization` config, which controls which locales _content fields_ are stored in (same four locales, `pl` default+fallback).
- Content fields marked `localized: true` in collections (e.g. product `title`, `description`, category `name`/`slug`) are stored per-locale in Payload; fetch with `locale` on `payload.find`/`findByID`.

### Payload CMS layer

- Config: `src/payload.config.ts` — Postgres adapter, Lexical editor, `seoPlugin` (scoped to `products`), custom admin logo/icon (`src/components/admin/`).
- Collections: `src/collections/{Users,Media,Category,Product,Brand}.ts`. `Product` is the largest/most complex — sidebar fields (slug, sku, status, badge, stockStatus, brand, external link) plus a tabbed body: "Treść" (content: title, categories, images, description, keyFeatures, warranty, multi-currency `prices` group) and "Warianty" (a `variants` array of model/color/size variants, each with its own optional `stockStatus` override — defaulting to `inherit` from the parent — and its own optional `priceOverrides` group, filled in only for currencies that differ from the base price).
- Schema push is off: every collection/field change needs `pnpm generate:types` + `pnpm migrate:create <name>` (files in `src/migrations/`), applied with `pnpm migrate`; Vercel runs migrations in `vercel-build`.
- Generated types live in `src/payload-types.ts` — **do not hand-edit**; regenerate with `pnpm generate:types` after touching any collection/field. This file (and `src/payload-generated-schema.ts`) is excluded from ESLint.
- Data-fetching helpers wrapping the Payload Local API live in `src/lib/data/` (e.g. `products.ts`, `categories.ts`) — typed, locale-aware `get*` functions used by frontend pages/server components. Follow this pattern (Local API + typed return shape) when adding new queries rather than calling `payload.find` ad hoc from components. `src/lib/payload.ts` exports a cached `getPayloadClient()` for places needing the raw client.
- Access control lives in `src/access/`: anonymous reads see only published products / active categories (`publicWhenStatus`), writes need a logged-in user, and `Users` has `admin`/`editor` roles (only admins manage users). Company/contact data is the `site-settings` global (`src/globals/SiteSettings.ts`, read via `getSiteSettings`).

### Frontend/UI

- Component folders under `src/components/`: `admin/` (custom Payload admin components), `catalog/`, `product/`, `home/`, `layout/`, `ui/` (shadcn-generated primitives).
- shadcn config: `components.json` — style `base-nova`, neutral base color, Tailwind CSS variables, Lucide icons, path aliases `@/components`, `@/lib`, `@/components/ui`, `@/hooks`.
- Path aliases (`tsconfig.json`): `@/*` → `src/*`, `@payload-config` → `src/payload.config.ts`.
- `src/lib/site.ts` exports `SITE_URL` from `NEXT_PUBLIC_SITE_URL`, used wherever absolute URLs are required (metadata, JSON-LD, OG image routes like `products/[slug]/opengraph-image.tsx`).

### Testing

- Unit tests (`tests/int/*.int.spec.ts`) run under Vitest with `jsdom` + `@vitejs/plugin-react`, resolving `tsconfig` path aliases; they don't touch the database.
- E2E tests (`tests/e2e/*.e2e.spec.ts`) run under Playwright against a real `pnpm dev` server; `tests/helpers/` has `login.ts` / `seedUser.ts` helpers for authenticated flows.
