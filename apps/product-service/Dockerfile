# FROM node:22-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install --omit=dev

# COPY src ./src

# EXPOSE 3000

# CMD ["npm", "start"]

#docker build -f apps/product-service/Dockerfile -t product-service:2.0 .
#docker build --no-cache -f apps/product-service/Dockerfile -t product-service:2.0 .
#docker run --rm -p 3002:3000 product-service:2.0

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
RUN pnpm install --filter product-service --prod

# Copy product-service source
COPY apps/product-service ./apps/product-service

WORKDIR /app/apps/product-service

EXPOSE 3000

CMD ["pnpm", "start"]

