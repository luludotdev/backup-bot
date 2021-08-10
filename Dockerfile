# syntax=docker/dockerfile:1.2
FROM node:16-alpine as base
FROM base AS deps-common

WORKDIR /app
COPY ./package.json ./yarn.lock ./

# ---
FROM deps-common AS deps-dev
RUN yarn install --ignore-optional --frozen-lockfile && \
  yarn cache clean

# ---
FROM deps-common AS deps-prod
RUN apk add --no-cache --virtual build-deps python3 alpine-sdk autoconf libtool automake && \
  yarn install --production=true --frozen-lockfile && \
  yarn cache clean && \
  apk del build-deps

# ---
FROM base AS builder
WORKDIR /app

COPY . .
COPY --from=deps-dev /app/node_modules ./node_modules
RUN yarn build

# ---
FROM base AS runner

WORKDIR /app
ENV NODE_ENV production

RUN apk add --no-cache tini

COPY --from=builder /app/build ./build
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN mkdir /app/logs && \
  addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 && \
  chown -R nodejs:nodejs /app/build && \
  chown -R nodejs:nodejs /app/logs

USER nodejs
VOLUME ["/app/logs"]

ARG GIT_REPO
LABEL org.opencontainers.image.source=${GIT_REPO}

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "."]
