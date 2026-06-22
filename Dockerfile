FROM node:20-alpine AS client-build
WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-slim AS server-build
WORKDIR /build/server
RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app

COPY --from=server-build /build/server/dist ./dist
COPY --from=server-build /build/server/node_modules ./node_modules
COPY --from=client-build /build/server/public ./public

RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=4895
ENV DATA_DIR=/data

EXPOSE 4895

CMD ["node", "dist/index.js"]
