FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy monorepo configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy order-service package definition
COPY apps/order-service/package.json ./apps/order-service/package.json

# Copy shared packages
COPY packages ./packages

# Install order-service dependencies
RUN pnpm install --filter order-service --prod

# Copy order-service source
COPY apps/order-service ./apps/order-service

# Switch to order-service directory
WORKDIR /app/apps/order-service

EXPOSE 3000

CMD ["pnpm", "start"]

