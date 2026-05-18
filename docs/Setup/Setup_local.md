# Local setup

Start the full local stack with:

```bash
npm run dev:local
```

The script creates missing `.env` files from the examples, creates the shared `printforge` Docker network, and starts WordPress plus the local PrintForge services.

Local URLs:

| Service | URL |
|---|---|
| WordPress | `http://localhost:8080` |
| PrintForge Admin | `http://localhost:5174/pf-admin/` |
| PrintForge iframe/configurator | `http://localhost:5174/pf/` |
| PrintForge API | `http://localhost:5174/api/` |

Manual equivalent:

```bash
docker network create printforge
docker compose -f docker/wordpress/compose.yml up -d
docker compose -f docker/printforge/compose.yml -f docker/printforge/compose.local.yml up -d
```

## Server setup

Server Caddy is expected to already be installed on the host. The production compose files bind PrintForge services to localhost-only ports so Caddy can route to them without exposing those ports publicly.

Create production env files first:

```bash
cp docker/printforge/.env.server.example docker/printforge/.env.server
cp docker/wordpress/.env.example docker/wordpress/.env
```

Set real production secrets in both files, then deploy:

```bash
npm run deploy:server
```

Server Caddy upstreams:

| Route | Upstream |
|---|---|
| `/api/*` | `127.0.0.1:3000` |
| `/pf-admin/*` | `127.0.0.1:5173` |
| `/pf/*` | `127.0.0.1:5174` |
| `/*` | `127.0.0.1:8080` |
