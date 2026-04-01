# Stage 1: Install dependencies
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Fix for the "RangeError: Invalid count value: -5" bug in Next.js 16.x
# We only target regular files (-type f) to avoid symlink errors
RUN find node_modules/next/dist -type f -name "*.js" -exec sed -i 's/\.repeat(\([^)]*\))/.repeat(Math.max(0, \1))/g' {} + || true

ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true
ENV NODE_ENV=production

# Run build with extra debug info
RUN npx next build --debug

# Stage 3: Production runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
