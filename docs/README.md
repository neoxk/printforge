# PrintForge Docs

## Structure

```
docs/
  overview/          System-wide: what PrintForge is, how the pieces fit together
  setup/             Getting the project running locally and in production
  backend/           Fastify backend — architecture decisions, guides, and per-module references
  frontend/          Admin and Configurator SPAs — architecture decisions, guides, and per-app references
  plugin/            WordPress / WooCommerce plugin
  packages/          Shared packages (e.g. @printforge/ui)
  infrastructure/    Docker, Caddy, deployment, environment variables
  libdocs/           Library documentations
```

## What goes where

| You want to document...                                        | Put it in...                          |
|----------------------------------------------------------------|---------------------------------------|
| How the system works as a whole                                | `overview/`                           |
| Local dev or environment setup                                 | `setup/`                              |
| A backend design decision or architectural pattern             | `backend/architecture/`               |
| How to do something on the backend (adding a module, etc.)     | `backend/guides/`                     |
| A backend module's API, data model, or internal library        | `backend/<module>/`                   |
| A frontend design decision or architectural pattern            | `frontend/architecture/`              |
| How to use a frontend pattern in a component                   | `frontend/guides/`                    |
| Docs specific to the Admin SPA                                 | `frontend/admin/`                     |
| Docs specific to the Configurator SPA                          | `frontend/configurator/`              |
| The WordPress plugin                                           | `plugin/`                             |
| A shared package like `@printforge/ui`                         | `packages/<package-name>/`            |
| Docker, Caddy, deployment, env vars                            | `infrastructure/`                     |

---

## Current contents

### overview/
- [`README.md`](overview/README.md) — System overview, actors, components, infrastructure
- [`server-structure.png`](overview/server-structure.png) — Infrastructure diagram

### setup/
- [`local.md`](setup/local.md) — Local development setup

### backend/
- [`products/api.md`](backend/products/api.md) — Products HTTP API specification (containers, config endpoint)
- [`pricing/overview.md`](backend/pricing/overview.md) — Pricing engine mental model, data model, calculation bases
- [`pricing/api.md`](backend/pricing/api.md) — Pricing HTTP API specification
- [`pricing/lib-usage.md`](backend/pricing/lib-usage.md) — Pricing lib API reference (`calculate`, `buildOrderContext`, types)
- [`pricing/er-diagram.png`](backend/pricing/er-diagram.png) — ER diagram (simplified)
- [`pricing/er-diagram-concrete.png`](backend/pricing/er-diagram-concrete.png) — ER diagram (concrete)

### frontend/
- [`architecture/services.md`](frontend/architecture/services.md) — Why we use the namespace service pattern
- [`architecture/state-management.md`](frontend/architecture/state-management.md) — Why we use reducers with action creators
- [`guides/using-services.md`](frontend/guides/using-services.md) — How to use `Groups`, `Items`, and `Pricing` in a component
- [`guides/using-reducers.md`](frontend/guides/using-reducers.md) — How to wire up `useReducer` with `PricingActions`
