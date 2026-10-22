FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy monorepo configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy product-service package definition
COPY apps/product-service/package.json ./apps/product-service/package.json

# Copy shared packages
COPY packages ./packages

# Install dependencies for product-service
RUN pnpm install --filter product-service...

# Copy product-service source
COPY apps/product-service ./apps/product-service

# Compile TypeScript to JavaScript
RUN pnpm --filter product-service build

WORKDIR /app/apps/product-service

EXPOSE 3000

CMD ["pnpm", "start"]
