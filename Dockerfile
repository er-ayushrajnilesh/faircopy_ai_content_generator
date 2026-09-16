# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------
# Stage 1 — build the React frontend (Vite) into static assets
# ------------------------------------------------------------------------
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package.json ./
# No package-lock.json is committed (see README), so this resolves fresh
# against the ranges in package.json. If you've generated a lockfile
# locally, copy it in above and switch this to `npm ci` for reproducible,
# faster builds.
RUN npm install
COPY client/ ./
RUN npm run build

# ------------------------------------------------------------------------
# Stage 2 — install production-only server dependencies
# ------------------------------------------------------------------------
FROM node:22-alpine AS server-deps
WORKDIR /app
COPY server/package.json ./
RUN npm install --omit=dev

# ------------------------------------------------------------------------
# Stage 3 — final runtime image
# ------------------------------------------------------------------------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Run as a non-root user for defense in depth.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=server-deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup server/ ./
COPY --from=client-build --chown=appuser:appgroup /app/client/dist ./public

USER appuser

EXPOSE 3000

# Dependency-free healthcheck using Node's built-in fetch (stable since
# Node 18) instead of pulling curl/wget into the Alpine image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
