# Simple CF Boilerplate

TanStack Start + oRPC + Cloudflare Workers + Neon Postgres + Drizzle + Better Auth. Monorepo, single deployable Worker. No Stripe, no OAuth, no email — just email/password auth, a typed oRPC API, and a shell.

Mirrors [`app-boilerplate`](../app-boilerplate) structure, stripped and targeted at Cloudflare Workers.

## Stack

- **Framework**: TanStack Start (React SSR) on Cloudflare Workers via `@cloudflare/vite-plugin`
- **API**: oRPC procedures mounted on Hono at `/api/rpc/*` via a TanStack catch-all; typed client + TanStack Query on the web
- **Database**: Neon Postgres (HTTP driver) + Drizzle ORM
- **Auth**: Better Auth (email/password only) with Drizzle adapter

## Layout

```
apps/
  api/              @repo/api — oRPC router on Hono (auth passthrough + me procedure)
  web/              @repo/web — TanStack Start shell, deploys to CF Workers
packages/
  auth/             @repo/auth — createAuth() factory
  db/               @repo/db — getDb() factory, schema, drizzle.config.ts
```

`apps/api` is not deployed alone — it's imported by `apps/web` and mounted via `apps/web/src/routes/api/$.tsx`. Everything ships as a single Worker.

## Cloudflare Workers Rules

1. **Never create DB / auth instances at module scope.** The `env` binding is only valid inside a request context. Packages export factories (`getDb()`, `createAuth()`).
2. **Access bindings via `cloudflare:workers`**, not `process.env`:
   ```ts
   import { env } from 'cloudflare:workers'
   env.DATABASE_URL
   ```
3. `nodejs_compat` is required (set in `apps/web/wrangler.jsonc`).

## Setup

```bash
pnpm install

# 1. Create a Neon project, copy the pooled connection string.

# 2. Local runtime secrets for the Worker:
cp apps/web/.dev.vars.example apps/web/.dev.vars
# Edit: set DATABASE_URL (Neon) and BETTER_AUTH_SECRET (openssl rand -hex 32)

# 3. Repo-root .env is used by drizzle-kit (migrate, studio) — NOT the Worker runtime:
cp .env.example .env
# Edit: same DATABASE_URL as above

# 4. Generate + push schema:
pnpm db:generate
pnpm db:push

# 5. Generate TypeScript types for bindings (reads .dev.vars + wrangler.jsonc):
pnpm cf-typegen

pnpm dev
```

Open http://localhost:3000.

## Adding an oRPC Procedure

Procedures live in `apps/api/src/orpc/router.ts`. Use `protectedProcedure` for authed calls (`context.session` is non-null) or `publicProcedure` otherwise. Validate inputs with Zod via `.input()`. Call `getDb()` / `createAuth()` inside the handler — never at module scope.

```ts
import { getDb } from '@repo/db'
import { protectedProcedure } from './base'

export const router = {
  me: protectedProcedure.handler(({ context }) => ({ user: context.session.user })),
  users: protectedProcedure.handler(() => getDb().query.user.findMany()),
}

export type AppRouter = typeof router
```

On the web, it is instantly typed:

```ts
import { client, orpc } from '~/lib/api'

await client.users()
const { data } = useQuery(orpc.users.queryOptions())
```

Better Auth keeps its own Hono handler at `/api/auth/*`; the oRPC handler is mounted at `/api/rpc/*`.

## Deploy

```bash
# One-time: push runtime secrets to the Worker
pnpm --filter @repo/web wrangler secret put DATABASE_URL
pnpm --filter @repo/web wrangler secret put BETTER_AUTH_SECRET
# Also set BETTER_AUTH_URL to the prod URL in apps/web/wrangler.jsonc vars

pnpm db:migrate   # run migrations against prod Neon
pnpm deploy
```
