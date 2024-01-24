FROM hub.lumigame.com/base/node:20.9.0-alpine AS builder
WORKDIR /app

ENV YARN_CACHE_FOLDER=/root/.yarn

RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn cache dir && yarn cache list

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn install --frozen-lockfile --verbose

COPY sentry.client.config.js sentry.server.config.js tsconfig.json configs.json game-settings.json next-i18next.config.js next.config.js ./
COPY configs ./configs
COPY public ./public
COPY configs/missing-configuration.js ./public/c.js
COPY src ./src

RUN yarn build

FROM hub.lumigame.com/base/node:20.9.0-alpine AS runner

WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/ ./

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 5000
CMD ["yarn", "start"]
