docker network create printforge

cd docker/wordpress && docker compose up -d
cd docker/printforge && docker compose -f compose.yml -f compose.local.yml up -d

cd backend && npm install && npm run dev
cd apps/admin && npm install && npm run dev
cd apps/configurator && npm install && npm run dev
