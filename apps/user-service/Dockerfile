FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy user-service package.json
COPY apps/user-service/package.json ./apps/user-service/package.json

# Copy shared workspace packages
COPY packages ./packages

# Install user-service and its workspace dependencies
RUN pnpm install --filter user-service...

# Copy application source
COPY apps/user-service ./apps/user-service

# Compile TypeScript to JavaScript
RUN pnpm --filter user-service build

# Run from user-service directory
WORKDIR /app/apps/user-service

EXPOSE 3000

CMD ["pnpm", "start"]
