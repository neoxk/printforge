# Local setup


```bash
docker network create printforge
docker compose -f docker/wordpress/compose.yml up -d
docker compose -f docker/printforge/compose.yml -f docker/printforge/compose.local.yml up -d
```
