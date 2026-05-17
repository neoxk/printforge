# CLAUDE.md

## Architecture

This is an npm workspaces monorepo (no Turbo) with three workspaces: `apps/*`, `packages/*`, `backend`.

### Backend (`/backend`)

- **Fastify 5** with Zod type provider (`fastify-type-provider-zod`)
- **Prisma 6** + **PostgreSQL 17**
- Entry: `index.ts` → `src/app.ts` (`createApp`)
- Modules in `src/modules/`: `auth`, `products`, `integration`, `pricing`, `validation`
- Shared lib in `src/lib/`: `prisma`, `errors`, `pricing/` (engine), `middleware`
- Env validated at startup via Zod in `src/config/env.ts`; import `env` directly throughout
- JWT auth uses dual namespaces (`access` + `refresh`) via `@fastify/jwt`
- Tests in `tests/unit/` and `tests/integration/` using Vitest

**Key schema entities:** `User`, `IntegrationConnection`, `Product`, `OptionsGroup`, `OptionItem`, `OptionsContainer`, `ContainerOptionItem`

**Pricing engine** (`src/lib/pricing/`): Computes price from calculation bases (YIELD_PCS, LINEAR_M, SQM, PERIMETER, PCS, ORDER, FREE) using a context of `{ widthMm, heightMm, quantity }`.

### Admin App (`/apps/admin`)

React 19 + Vite SPA for store owners. Three-layer frontend pattern:

1. **API client** (`src/lib/api/client.ts`): `apiRequest` handles fetch, JWT tokens, and refresh flow
2. **Services** (`src/lib/services/`): Namespace-pattern modules (no class instances) grouping API calls by domain (Groups, Items, Pricing)
3. **Reducers** (`src/lib/reducers/`): Pure `(state, action) → nextState` functions with typed `ActionCreators` — one file per domain

State flows down from page-level components; services call the API client and return plain data; reducers handle all state transitions.

### Configurator App (`/apps/configurator`)

React 19 + Vite SPA for end customers (embedded iframe). Uses **fabric.js** for canvas. Currently minimal/placeholder.

### Shared UI Package (`/packages/ui`)

`@printforge/ui` — shared React component library used by both apps. Exports components, hooks, and domain types from `src/index.ts`.

## Environment Variables

**Backend** (see `backend/.env.example`):
```
DATABASE_URL=postgresql://...
JWT_SECRET=
JWT_REFRESH_SECRET=
PORT=3000
NODE_ENV=development
```

**Frontend** (set via Vite env or Docker compose):
```
VITE_API_PROXY_TARGET=http://localhost:3000
VITE_BASE_PATH=/pf-admin/   # or /pf/ or /
```

## Docs

See `docs/README.md` for the index. Key docs:

| Path | Contents |
|------|----------|
| `docs/overview/README.md` | System actors, components, infra diagram |
| `docs/setup/local.md` | Local dev setup with Docker |
| `docs/backend/pricing/overview.md` | Pricing engine mental model |
| `docs/backend/pricing/api.md` | Pricing API spec |
| `docs/backend/pricing/lib-usage.md` | Pricing library usage |
| `docs/frontend/architecture/services.md` | Service layer pattern |
| `docs/frontend/architecture/state-management.md` | Reducer/state pattern |
| `docs/frontend/guides/using-services.md` | How to use services |
| `docs/frontend/guides/using-reducers.md` | How to use reducers |
