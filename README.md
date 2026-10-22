# Node.js E-commerce Microservices Monorepo

A pnpm workspace with an API gateway, user, product, and order services, plus
shared configuration, model, and logger packages. The order service retrieves
user and product data from their services when creating an order. Orders are
stored in memory and are lost when the order service restarts.

## Workspace layout

```text
apps/
  api-gateway/        TypeScript API gateway (port 82)
  user-service/       User API (TypeScript entry point, JavaScript routes)
  product-service/    Product API (TypeScript entry point, JavaScript routes)
  order-service/      Order API and user/product service calls
packages/
  config/             Shared environment configuration
  model/              Shared User, Product, and Order types
  logger/             Shared logger and date formatter
helm/
  ecommerce1.1/       Kubernetes Helm chart
```

The services use shared types from `@packages/model` and logging from
`@packages/logger`. The gateway and services compile to JavaScript in their
local `dist/` folders and start from the compiled output.

## Prerequisites

- Node.js 22 or later
- pnpm 10.28.0

Install dependencies from the repository root:

```sh
pnpm install
```

## Run locally

Start all services in development mode:

```sh
pnpm dev
```

This starts the user service on port `3001`, product service on `3002`, order
service on `3003`, and API gateway on `82`. Each service can also be started
individually:

```sh
pnpm --filter api-gateway dev
pnpm --filter user-service dev
pnpm --filter product-service dev
pnpm --filter order-service dev
```

The gateway uses nodemon to restart when its TypeScript source changes. The
other services use `tsx watch` for development. The order service's script sets
its user and product service URLs to `http://localhost:3001` and
`http://localhost:3002`.

To build and start the workspace instead:

```sh
pnpm build
pnpm start
```

Each service's build writes JavaScript to its `dist/` folder, and its start
script runs `dist/server.js`. The Dockerfiles build these outputs into the
service images.

## Services and API

| Service | Local URL | Routes |
| --- | --- | --- |
| API Gateway | `http://localhost:82` | Proxies the user, product, and order routes |
| User | `http://localhost:3001` | `GET /health`, `GET /user`, `GET /user/:id` |
| Product | `http://localhost:3002` | `GET /health`, `GET /product`, `GET /product/:id` |
| Order | `http://localhost:3003` | `GET /health`, `GET /order`, `POST /order` |

The gateway and Docker Compose proxy use `/api/users`, `/api/products`, and
`/api/orders` prefixes, forwarding the remaining path to the corresponding
service. For example, the user list can be requested directly at
`http://localhost:3001/user` or through the gateway at
`http://localhost:82/api/users/user`.

Check health and list catalog items:

```sh
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

curl http://localhost:3001/user
curl http://localhost:3002/product
```

Create an order by providing integer `userId` and `productId` values.
`quantity` is optional and defaults to `1`:

```sh
curl -X POST http://localhost:3003/order \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"productId\":101,\"quantity\":2}"
```

The gateway can be used in place of the direct order-service URL:

```sh
curl -X POST http://localhost:82/api/orders/order \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"productId\":101,\"quantity\":2}"

curl http://localhost:82/api/orders/order
```

An order response includes the resolved user and product, quantity, total, and
status. Repeating an order for the same user and product returns `409`.

## Docker Compose

Build and start the services and Nginx gateway:

```sh
docker compose up --build -d
```

The gateway is available on `http://localhost:82`. View logs or stop the
services with:

```sh
docker compose logs -f
docker compose down
```

To build a service image individually, run these commands from the repository
root so Docker can access the workspace packages:

```sh
docker build -f apps/user-service/Dockerfile -t user-service:local .
docker build -f apps/product-service/Dockerfile -t product-service:local .
docker build -f apps/order-service/Dockerfile -t order-service:local .
```

Each service container listens on port `3000`. In a container deployment,
configure `USER_SERVICE_URL` and `PRODUCT_SERVICE_URL` with addresses reachable
from the order service container.

## Kubernetes with Helm

The chart is in `helm/ecommerce1.1`. Update the image registry and image tags in
`helm/ecommerce1.1/values.yaml` for your cluster, then validate and install it:

```sh
helm lint ./helm/ecommerce1.1/
helm install ecommerce ./helm/ecommerce1.1/
```

Remove the release with:

```sh
helm uninstall ecommerce
```

### Service Test using Docker
```
$ docker exec monorepo-nodejs-project-nginx-1 sh -c "curl -X POST -H 'Content-Type: application/json' -d '{\"userId\":5,\"productId\":103,\"quantity\":2}' http://order-service:3000/order"
                          0
{
	"message":"An order already exists for this user and product",
	"existingOrder":{
		"order":{"id":"1","user":{"id":5,"name":"Liam","address":"56 Maple Street"},"product":{"id":103,"name":"Mouse","price":1200},"quantity":2,"totalAmount":2400,"status":"CREATED"}
	}
}

$ docker exec monorepo-nodejs-project-nginx-1 sh -c "curl -H 'Content-Type: application/json' http://order-service:3000/order"

{"id":"1","user":{"id":7,"name":"Ava","address":"19 Willow Court"}]

$  docker exec monorepo-nodejs-project-nginx-1 sh -c "curl -H 'Content-Type: application/json' http://product-service:3000/product"

[{"id":101,"name":"Laptop","price":75000},{"id":102,"name":"Keyboard","price":3000}]

$  docker exec monorepo-nodejs-project-nginx-1 sh -c "curl -H 'Content-Type: application/json' http://user-service:3000/user"

 [{"id":1,"name":"John","address":"123 Main St"},{"id":2,"name":"David","address":"456 Oak Ave"}]
```


## Root scripts

The root `package.json` provides these workspace commands:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run each service's development script in parallel |
| `pnpm build` | Build or type-check each workspace service |
| `pnpm start` | Run each service's start script in parallel |
| `pnpm lint` | Run service lint scripts |
| `pnpm test` | Run service test scripts |

The service test scripts are currently placeholders; no automated service test
suite is configured yet.
