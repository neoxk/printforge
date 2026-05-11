docker network create printforge

cd docker/wordpress && docker compose up -d
cd docker/printforge && docker compose -f compose.yml -f compose.local.yml up -d

npm i
npm run dev
