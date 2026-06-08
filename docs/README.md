# PrintForge Docs

## Structure

```
docs/
  overview/          System-wide: what PrintForge is, how the pieces fit together
  setup/             Getting the project running locally and in production
  backend/           Fastify backend - per-module references and architecture patterns
  frontend/          Admin and Configurator SPAs - architecture decisions and guides
  libdocs/           Third-party library documentation used during development
```

## What goes where

| You want to document...                                        | Put it in...                          |
|----------------------------------------------------------------|---------------------------------------|
| How the system works as a whole                                | `overview/`                           |
| Local dev or environment setup                                 | `setup/`                              |
| A backend module's API, data model, or internal library        | `backend/<module>/`                   |
| A frontend design decision or architectural pattern            | `frontend/architecture/`              |
| How to use a frontend pattern in a component                   | `frontend/guides/`                    |

---

## Current contents

### overview/
- [`README.md`](overview/README.md) - System overview, actors, components, infrastructure
- [`server-structure.png`](overview/server-structure.png) - Infrastructure diagram

### setup/
- [`local.md`](setup/local.md) - Local development setup and production deployment

### backend/
- [`products/api.md`](backend/products/api.md) - Products HTTP API (list, config, print areas, containers, items)
- [`pricing/overview.md`](backend/pricing/overview.md) - Pricing engine mental model, data model, calculation bases
- [`pricing/api.md`](backend/pricing/api.md) - Pricing HTTP API (groups, items, calculate, quantity-table)
- [`pricing/lib-usage.md`](backend/pricing/lib-usage.md) - Pricing lib API reference (`calculate`, `buildOrderContext`, types)
- [`pricing/er-diagram.png`](backend/pricing/er-diagram.png) - ER diagram (simplified)
- [`pricing/er-diagram-concrete.png`](backend/pricing/er-diagram-concrete.png) - ER diagram (concrete)
- [`authorization/README.md`](backend/authorization/README.md) - JWT (Admin SPA) and shared-secret (WooCommerce plugin) authorization
- [`storage/README.md`](backend/storage/README.md) - Designer S3 upload flow and file lifecycle

### frontend/
- [`architecture/services.md`](frontend/architecture/services.md) - Why we use the namespace service pattern
- [`architecture/state-management.md`](frontend/architecture/state-management.md) - Why we use reducers with action creators
- [`guides/using-services.md`](frontend/guides/using-services.md) - How to use `Groups`, `Items`, and `Pricing` in a component
- [`guides/using-reducers.md`](frontend/guides/using-reducers.md) - How to wire up `useReducer` with `PricingActions`
