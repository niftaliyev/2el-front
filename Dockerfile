FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Development stage ends here if targeted. 
# We don't run build here because for dev we'll use volumes and 'npm run dev'

# Production build stage
FROM builder AS build-prod
RUN npm run build

# Production runner stage
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy necessary files from build-prod
COPY --from=build-prod /app/public ./public
COPY --from=build-prod /app/.next ./.next
COPY --from=build-prod /app/node_modules ./node_modules
COPY --from=build-prod /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start"]
