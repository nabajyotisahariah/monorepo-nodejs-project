# FROM node:22-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install --omit=dev

# COPY src ./src

# EXPOSE 3000

# CMD ["npm", "start"]

# FROM node:22-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install --omit=dev

# COPY src ./src

# EXPOSE 3000

# CMD ["npm", "start"]

#docker build -f apps/user-service/Dockerfile -t user-service:2.0 .
#docker build --no-cache -f apps/user-service/Dockerfile -t user-service:2.0 .
#docker run --rm -p 3001:3000 user-service:2.0

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
RUN pnpm install --filter user-service --prod

# Copy application source
COPY apps/user-service ./apps/user-service

# Run from user-service directory
WORKDIR /app/apps/user-service

EXPOSE 3000

CMD ["pnpm", "start"]

