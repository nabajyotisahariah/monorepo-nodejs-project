# Node.js E-commerce Microservices Monorepo

A pnpm workspace containing three Express services and shared packages. The
order service calls the user and product services when creating an order. The
repository also includes Dockerfiles for each service and a Helm chart for
Kubernetes deployment.

## Services

| Service | Local port | Endpoints |
| --- | ---: | --- |
| User | `3001` | `GET /health`, `GET /users`, `GET /users/:id` |
| Product | `3002` | `GET /health`, `GET /products`, `GET /products/:id` |
| Order | `3000` | `GET /health`, `GET /orders`, `POST /orders` |

The user and product services return sample data. Orders are stored in memory
and are lost when the order service restarts.

## Prerequisites

- Node.js 22 (the version used by the service Dockerfiles)
- pnpm 12.4.1 (the version pinned in the root `package.json`)

Install dependencies from the repository root:

```sh
pnpm install
```

## Run locally

Start all services in parallel:

```sh
pnpm dev
```

Or start a single service:

```sh
pnpm --filter user-service dev
pnpm --filter product-service dev
pnpm --filter order-service dev
```

Or Running build services locally

```sh
$ PORT=3001 pnpm start:user
$ pnpm --filter user-service start

$  PORT=3002 pnpm start:product
$ pnpm --filter product-service start

$  PORT=3000 pnpm start:order
$ pnpm --filter order-service start
```

The development scripts configure each service's local port and the order
service's dependency URLs. The order service defaults to
`http://localhost:3001` for users and `http://localhost:3002` for products.

## Cross-origin requests

All services enable CORS. By default, `CORS_ORIGINS` is `*`, allowing
cross-origin browser requests from any origin without credentials. To restrict
browser access, set `CORS_ORIGINS` to a comma-separated list of exact origins,
including the scheme and optional port (for example,
`https://shop.example.com,http://localhost:5173`). Credentialed requests are
not enabled. CORS is a browser access policy, not authentication or API access
control.

## API examples

Check service health:

```sh
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
```

List users or products:

```sh
curl http://localhost:3001/users
curl http://localhost:3002/products
```

Create an order:

```sh
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"productId\":101,\"quantity\":2}"
```

The order service retrieves the user and product before calculating the total.
`quantity` is optional and defaults to `1`. The response contains an `order`
object with the full `user` and `product` objects in place of their IDs.
Created orders can be listed at `GET http://localhost:3000/orders`.

## Workspace layout

```text
apps/
  user-service/       User API (routes in src/routes/)
  product-service/    Product API (routes in src/routes/)
  order-service/      Order API and calls to user/product services (routes in src/routes/)
packages/
  config/             Shared environment configuration
  common/             Shared TypeScript User and Product entities
  logger/             Shared logger and date formatter
helm/
  ecommerce1.1/       Kubernetes Helm chart
```

Each service uses the shared `User` and `Product` types from
`@packages/common`; the user and product services apply them to their catalog
data, and the order service uses them when creating orders. The shared
`Order` entity is also defined there and used by the order service. Service
logic is written in TypeScript and type-checked by each service's `build`
script; `tsx` runs the JavaScript Express entry points and TypeScript service
modules. The shared logger is provided by `@packages/logger`. Workspace
packages are included through the root `pnpm-workspace.yaml`.

## Docker

Build each image from the repository root so Docker can access the workspace
manifest and shared packages:

```sh
docker build -f apps/user-service/Dockerfile -t user-service:local .
docker build -f apps/product-service/Dockerfile -t product-service:local .
docker build -f apps/order-service/Dockerfile -t order-service:local .
```

Each container listens on port `3000`. When running the order container, set
`USER_SERVICE_URL` and `PRODUCT_SERVICE_URL` to addresses reachable from that
container.

## Kubernetes with Helm

The chart is in `helm/ecommerce1.1`. Its values configure two replicas per
service, ClusterIP services, health probes, and ingress paths for `/users`,
`/products`, and `/orders`.

Before installing, build and push the service images to a registry accessible
to your cluster, and update the registry, project, repository, and image tags
in `helm/ecommerce1.1/values.yaml` to match those images. Then validate and
install the chart:

```sh
helm lint ./helm/ecommerce1.1/
helm install ecommerce ./helm/ecommerce1.1/
```

To remove the release:

```sh
helm uninstall ecommerce
```

## Root scripts

The root `package.json` also defines recursive `build`, `lint`, `test`, and
`start` scripts. Individual services currently provide placeholder build and
test scripts; no service test suite is configured yet.
