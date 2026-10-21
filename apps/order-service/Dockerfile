# FROM node:22-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install --omit=dev

# COPY src ./src

# EXPOSE 3000

# CMD ["npm", "start"]

#docker build -f apps/order-service/Dockerfile -t order-service:2.0 .
#docker build --no-cache -f apps/order-service/Dockerfile -t order-service:2.0 .
#docker run --rm -p 3000:3000 order-service:2.0

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

