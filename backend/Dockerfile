FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile --prod

COPY . .

# Don't copy credentials — mount as Docker secret or env at runtime
# Don't copy .env — inject via docker-compose environment

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "scripts/server.js"]
