FROM node:20-slim AS base
RUN npm install -g pnpm@9.9.0

WORKDIR /app

COPY ./src/               /app/src/
COPY ./package.json       /app/package.json
COPY ./pnpm-lock.yaml     /app/pnpm-lock.yaml
COPY ./vite.config.js     /app/vite.config.js
COPY ./svelte.config.js   /app/svelte.config.js
COPY ./postcss.config.cjs /app//postcss.config.cjs

RUN pnpm install -P --frozen-lockfile
RUN pnpm run build

FROM node:20-slim
RUN apt update -y; apt install -y curl
RUN npm install -g pnpm@9.9.0

WORKDIR /app

COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./

RUN pnpm install -P --frozen-lockfile

COPY --from=base /app/build ./

ENV ROOT_DATABASE_URL=""

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl --fail http://localhost:3000 || exit 1

CMD ["node", "./index.js"]
