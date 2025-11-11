FROM node:24.9-alpine AS base

WORKDIR /app

# Install build dependencies and OpenSSL for Prisma
RUN apk add --no-cache g++ make openssl openssl-dev python3

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code (excluding .env files via .dockerignore)
COPY tsconfig.json ./
COPY vitest.config.ts ./
COPY eslint.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY CHANGELOG.md ./
COPY src ./src
COPY public ./public
COPY views ./views
COPY locales ./locales
COPY scripts ./scripts

# Build CSS with Tailwind v4 (must be before app build)
RUN npm run css:build

# Build application
RUN npm run build

# Production stage
FROM node:24.9-alpine AS production

WORKDIR /app

# Install runtime dependencies including netcat and wget for health checks
RUN apk add --no-cache netcat-openbsd openssl wget

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy Prisma schema and generated client (from builder stage)
COPY --from=base /app/prisma ./prisma
# Engines and generated artifacts
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
# Generated Prisma Client code (ensures client is available without re-running generate in production)
COPY --from=base /app/node_modules/@prisma/client ./node_modules/@prisma/client
# Prisma CLI (needed for migrate deploy in entrypoint)
COPY --from=base /app/node_modules/prisma ./node_modules/prisma
COPY --from=base /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Copy built application
COPY --from=base /app/dist ./dist

# Copy public assets and views for SSR
COPY --from=base /app/public ./public
COPY --from=base /app/views ./views
COPY --from=base /app/locales ./locales
COPY --from=base /app/CHANGELOG.md ./CHANGELOG.md

# Copy docker entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application with entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
