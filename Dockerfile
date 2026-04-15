# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ElanAz Frontend – Production Dockerfile
#  Next.js standalone output, multi-stage build
#
#  LOCAL BUILD & RUN:
#    docker build -t elanaz-frontend .
#    docker run -p 3000:3000 --env-file .env.local elanaz-frontend
#
#  SERVER (Ubuntu):
#    docker build -t elanaz-frontend .
#    docker run -d -p 3000:3000 --env-file .env --name elanaz-frontend --restart unless-stopped elanaz-frontend
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ─── Stage 1: Install dependencies ───────────────────────────────────
FROM node:20-alpine AS deps
# libc6-compat – bəzi native npm paketlərinin Alpine-də işləməsi üçündür
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Yalnız package faylları: Docker layer cache üçün optimallaşdırma.
# Dependencies yalnız bu fayllar dəyişdikdə yenidən qurulur.
COPY package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: Build the application ──────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Dep mərhələsindən qurulmuş node_modules-u kopyala
COPY --from=deps /app/node_modules ./node_modules
# Bütün layihə kodunu kopyala
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Production build: next.config.ts-dəki output:'standalone' sayəsində
# .next/standalone qovluğu yaranır – node_modules olmadan işləyə bilən minimal build.
RUN npm run build

# ─── Stage 3: Production runner ───────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Təhlükəsizlik: container-i root user ilə işlətmə
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Public faylları kopyala (şəkillər, favicon və s.)
COPY --from=builder /app/public ./public

# standalone build – bütün lazımi faylları özündə daşıyır (ayrı node_modules lazım deyil)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Static fayllar (CSS, JS chunk-ları) – standalone tərəfindən avtomatik əlavə edilmir
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# standalone build-in entry point-i server.js-dir (npm start deyil!)
CMD ["node", "server.js"]
