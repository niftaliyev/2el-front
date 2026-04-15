FROM node:20-bookworm-slim

WORKDIR /app

# install deps
COPY package.json package-lock.json ./
RUN npm ci

# copy project
COPY . .

# env
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# build
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
