# FANSYCLUB

Foundation de una plataforma SaaS multi-tenant para que artistas, creadores y emprendedores administren su propio World.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/fansyclub run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — secret used to hash opaque session tokens
- Managed web env: `PORT` and `BASE_PATH` — injected by the FANSYCLUB workflow

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/fansyclub` — React/Vite web app for landing, auth, Studio, Control Center, and public World routes.
- `artifacts/api-server` — Express API mounted under `/api`.
- `lib/api-spec/openapi.yaml` — source of truth for API contracts.
- `lib/api-client-react` and `lib/api-zod` — generated client hooks and validation schemas.
- `lib/db/src/schema` — Drizzle models for users, sessions, Worlds, memberships, audit logs, and security events.
- `docs/foundation.md` — Phase 001 technical notes and acceptance coverage.

## Architecture decisions

- Session authentication uses opaque random tokens stored only as HMAC hashes in PostgreSQL; the browser receives an HttpOnly cookie.
- Passwords are stored as salted `scrypt` hashes and never returned from API responses.
- Worlds have an owner plus a separate membership table so collaboration can evolve beyond one user = one World.
- OWNER, STAFF, and USER permissions are evaluated in backend middleware and route handlers, not only in the frontend.
- Audit logs and security events are first-class tables from the foundation phase, even though coverage is intentionally limited.

## Product

Phase 001 provides registration, login, logout, protected Studio access, World creation/listing, public World resolution by slug, and a role-aware Control Center gate. Later entities and monetization are intentionally not implemented.

## User preferences

- Keep the implementation limited to the approved Fase 001 Foundation scope.

## Gotchas

- Run API codegen after any OpenAPI change before importing new hooks or Zod schemas.
- Run `pnpm --filter @workspace/db run push` after development schema changes.
- Direct Vite builds need `PORT` and `BASE_PATH`; the managed workflow supplies them automatically.
- No production-like seed data is included.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
