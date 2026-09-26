# UTSlovakia

Product catalogue with a CMS for Unique Technology Solution s.r.o. It is **not a shop**: products link out to eBay, or to the contact page for a quote.

- **Frontend:** Next.js 16 (App Router), Tailwind CSS 4, `next-intl` in four languages (`pl` default, `en`, `sk`, `pt-br`)
- **CMS and API:** Payload CMS 3 at `/admin`, with its REST/GraphQL API at `/api`
- **Database:** Postgres (Neon)
- **Media:** Cloudflare R2 (S3-compatible)
- **Hosting:** Vercel

The editor guide (in Polish) is [`docs/instrukcja-admin.md`](docs/instrukcja-admin.md). Architecture notes for developers are in [`CLAUDE.md`](CLAUDE.md).

## Local setup

Requires Node ≥ 20.9 and pnpm 11.

```bash
pnpm install
cp .env.example .env          # then fill it in (see below)
pnpm migrate                  # create/update the schema
pnpm dev                      # http://localhost:3000, admin at /admin
```

**Never develop against the production database.** Use a [Neon branch](https://neon.tech/docs/introduction/branching) of production (a copy with real data), or a local Postgres (`createdb utslovakia_dev`). Point `DATABASE_URL` in `.env` at it.

On an empty database, `/admin` first asks you to create a user. The first account automatically gets the **admin** role.

### Environment variables

| Variable                                                               | Required        | Notes                                                                                               |
| ---------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                         | yes             | Postgres connection string. On Vercel use Neon's pooled (`-pooler`) URL.                            |
| `PAYLOAD_SECRET`                                                       | yes             | Long random string. The app refuses to start without it. Changing it logs everyone out.             |
| `NEXT_PUBLIC_SITE_URL`                                                 | yes             | Public origin, e.g. `https://www.utslovakia.sk`. Used for canonical/OG/JSON-LD URLs and admin CSRF. |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | on Vercel       | R2 bucket and API token. Required when `VERCEL` is set.                                             |
| `S3_PUBLIC_HOSTNAME`                                                   | yes, for images | The R2 custom domain images are served from (allowed in `next/image`).                              |

For tests, create **`.env.test.local`** (gitignored). The test configs load it before `.env`:

```bash
DATABASE_URL=postgresql://…/utslovakia_test   # must differ from the one in .env
E2E_ALLOW_DB_WRITES=true
```

## Scripts

| Command                                              | What it does                                                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm dev` / `pnpm devsafe`                          | Dev server (`devsafe` clears `.next` first)                                                     |
| `pnpm build` / `pnpm start`                          | Production build / server                                                                       |
| `pnpm lint`, `pnpm typecheck`                        | ESLint, `tsc --noEmit`                                                                          |
| `pnpm test:int`                                      | Unit tests (Vitest, no database)                                                                |
| `pnpm test:e2e`                                      | Playwright against `pnpm dev`. Seeds and removes a test user in the `.env.test.local` database. |
| `pnpm migrate` / `migrate:status` / `migrate:create` | Payload migrations                                                                              |
| `pnpm generate:types`                                | Regenerate `src/payload-types.ts` after changing collections or fields                          |
| `pnpm generate:importmap`                            | Regenerate the admin import map after adding admin components                                   |
| `pnpm vercel-build`                                  | `migrate` + `build`. Vercel runs this automatically instead of `build`.                         |

`scripts/one-off/` holds the scripts used for the initial product import and a media repair. Read the header of each before running; they are not part of the normal workflow.

## Schema changes (migrations)

Automatic schema push is **off** (`push: false` in `src/payload.config.ts`). Every schema change goes through a migration:

1. Change a collection, global or field.
2. `pnpm generate:types`
3. `pnpm migrate:create <short-name>` writes `src/migrations/<timestamp>_<name>.ts`. Review the SQL.
4. `pnpm migrate` applies it to your dev database.
5. Commit the migration together with the code. On deploy, `vercel-build` applies it to production before building.

Label or description changes don't need a migration. `migrate:create` tells you when nothing changed.

## Deploying (Vercel)

- Framework preset: Next.js. The build runs `pnpm vercel-build` (migrations first, then `next build`).
- Set all the variables above for Production, and for Preview with a **Neon branch** database. Otherwise previews would run migrations against production.
- The admin only accepts logged-in requests from `NEXT_PUBLIC_SITE_URL`, the Vercel deployment URLs and (outside production) `localhost:3000`.
- Uploads go through the server, so Vercel's ~4.5 MB request limit applies. The admin rejects files over 4 MB with a Polish message.

### First deploy of the migrations setup

Production's schema was originally created by schema push, not by migrations. Before the **first** deploy that includes `src/migrations/`:

1. Compare production's schema with `20260926_020142_baseline` (e.g. on a Neon branch of production: `pnpm migrate:status`, or diff `pg_dump --schema-only` against a database created by `pnpm migrate`).
2. Record the baseline as already applied, so only the later migrations run:
   ```sql
   INSERT INTO payload_migrations (name, batch, updated_at, created_at)
   VALUES ('20260926_020142_baseline', 1, now(), now());
   ```
3. Try `pnpm migrate` on a Neon branch of production first, then deploy.

The second migration adds user roles, version history and site settings. It makes every existing user an admin and pre-fills the company data.

## Media (Cloudflare R2)

- Bucket objects live under the `media/` prefix. Payload stores webp originals (max 2400 px) plus `thumbnail`, `card`, `gallery` and `og` sizes.
- Serve the bucket through a custom domain (`S3_PUBLIC_HOSTNAME`). Keep the API token scoped to this bucket.
- Consider enabling bucket versioning (or lifecycle rules) so a deleted image can be recovered.

## Backups

- **Database:** Neon's point-in-time restore covers the retention window of the client's Neon plan (check it in the Neon console; the free tier is short). For longer retention, add a scheduled `pg_dump` (e.g. a nightly GitHub Action uploading to a separate R2 bucket).
- **Media:** R2 has no automatic backups. Enable versioning or copy the bucket periodically.
- To restore, create a Neon branch from a point in time, check it, then promote it or point `DATABASE_URL` at it.

## Project layout

```
src/
  app/(payload)/            Payload admin + API routes (generated, don't edit)
  app/[locale]/(frontend)/  Public site: home, products, category, contact
  collections/, globals/    Payload schema (Product, Category, Brand, Media, Users, SiteSettings)
  access/, fields/, hooks/  Shared access rules, the slug field, cache revalidation
  lib/data/                 Typed, cached Local API queries used by pages
  lib/seo/                  hreflang alternates, JSON-LD, meta helpers, OG image
  messages/                 UI strings per locale (next-intl)
  migrations/               Database migrations
tests/int/                  Unit tests
tests/e2e/                  Playwright tests
```
