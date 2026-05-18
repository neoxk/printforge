FROM node:lts AS build

WORKDIR /app
ARG VITE_BASE_PATH=/pf/
ENV VITE_BASE_PATH=${VITE_BASE_PATH}

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/configurator/package.json apps/configurator/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci --include=optional

COPY apps/configurator apps/configurator
COPY packages/ui packages/ui

RUN npm run build --workspace=apps/configurator

FROM nginx:1.27-alpine AS runtime

COPY apps/configurator/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/configurator/dist /usr/share/nginx/html/pf

EXPOSE 80
