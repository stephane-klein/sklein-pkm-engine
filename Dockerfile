FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY ./src/                 /app/src/
COPY ./package.json         /app/package.json
COPY ./pnpm-lock.yaml       /app/pnpm-lock.yaml
COPY ./vite.config.js       /app/vite.config.js
COPY ./svelte.config.js     /app/svelte.config.js
COPY ./postcss.config.cjs   /app/postcss.config.cjs
COPY ./static/version.json  /app/static/version.json

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
RUN apt update -y; apt install -y curl

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

ENV ROOT_DATABASE_URL=""

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl --fail http://localhost:3000 || exit 1

CMD ["node", "./build/index.js"]
