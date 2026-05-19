FROM node:lts AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/configurator/package.json apps/configurator/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci --include=optional

COPY backend backend

RUN npm run db:generate --workspace=backend \
  && npm run build --workspace=backend

FROM node:lts-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma

EXPOSE 3000

CMD ["node", "backend/dist/index.js"]
