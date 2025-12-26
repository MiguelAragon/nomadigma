# ====================
# Multi-stage build para Next.js 16 con CapRover
# ====================

# Stage 1: Dependencies
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# ====================
# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Generate Prisma Client (NO migraciones, solo el cliente)
RUN npx prisma generate

# Accept build arguments for NEXT_PUBLIC_ variables
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Build Next.js application
RUN npm run build

# ====================
# Stage 3: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
# Copy Prisma Client and CLI
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
# Copy all Prisma dependencies (needed for migrate deploy)
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Copy Next.js build output (standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy start script
COPY --from=builder /app/start.sh ./start.sh

# Set correct permissions
RUN chown -R nextjs:nodejs /app && \
    chmod +x /app/start.sh

USER nextjs

EXPOSE 3000

# Health check - más tiempo de inicio para permitir que las migraciones terminen
HEALTHCHECK --interval=15s --timeout=10s --start-period=90s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Ejecutar migraciones y luego iniciar el servidor usando el script
CMD ["/app/start.sh"]

