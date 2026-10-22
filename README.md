# Node.js E-commerce Microservices Monorepo

A pnpm workspace containing four Express services (including an API gateway) and shared packages. The
order service calls the user and product services when creating an order. The
repository also includes Dockerfiles for each service and a Helm chart for
Kubernetes deployment.

## Services

| Service | Local port | Endpoints |
| --- | ---: | --- |
| API Gateway | `82` | Proxies `/api/users`, `/api/products`, `/api/orders` |
| User | `3001` | `GET /health`, `GET /users`, `GET /users/:id` |
| Product | `3002` | `GET /health`, `GET /products`, `GET /products/:id` |
| Order | `3003` | `GET /health`, `GET /orders`, `POST /orders` |

The user and product services return sample data. Orders are stored in memory
and are lost when the order service restarts.

## Prerequisites

- Node.js 22 (the version used by the service Dockerfiles)
- pnpm 10.28.0 (the version pinned in the root `package.json`)

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
pnpm --filter api-gateway dev
pnpm --filter user-service dev
pnpm --filter product-service dev
pnpm --filter order-service dev
```

Or Running build services locally

```sh
pnpm build

$ PORT=82 pnpm start:api-gateway
  pnpm --filter api-gateway start

$ PORT=3001 pnpm start:user
  pnpm --filter user-service start

$ PORT=3002 pnpm start:product
  pnpm --filter product-service start

$ PORT=3003 pnpm start:order
  pnpm --filter order-service start
```

The development scripts configure each service's local port and the order
service's dependency URLs. The API gateway uses nodemon to restart when
TypeScript files in `apps/api-gateway/src` change. The user, product, and order
service entry points are also TypeScript files. The order service defaults to
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
curl http://localhost:3003/health
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
curl -X POST http://localhost:3003/orders \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"productId\":101,\"quantity\":2}"
```

The order service retrieves the user and product before calculating the total.
`quantity` is optional and defaults to `1`. The response contains an `order`
object with the full `user` and `product` objects in place of their IDs.
Created orders can be listed at `GET http://localhost:3003/orders`.

API Gateway Endpoints
```
curl --location 'http://localhost:82/api/products/product'
curl --location 'http://localhost:82/api/users/user'
curl --location 'http://localhost:82/api/orders/order' \
--data '{"userId":7,"productId":103,"quantity":2}'
curl --location 'http://localhost:82/api/orders/order'
```

## Workspace layout

```text
apps/
  api-gateway/        API Gateway proxying requests to services (runs on port 82)
  user-service/       User API (routes in src/routes/)
  product-service/    Product API (routes in src/routes/)
  order-service/      Order API and calls to user/product services (routes in src/routes/)
packages/
  config/             Shared environment configuration
  model/              Shared TypeScript User, Product, and Order entities
  logger/             Shared logger and date formatter
helm/
  ecommerce1.1/       Kubernetes Helm chart
```

Each service uses the shared `User` and `Product` types from
`@packages/model`; the user and product services apply them to their catalog
data, and the order service uses them when creating orders. The shared
`Order` entity is also defined there and used by the order service. Service
logic is written in TypeScript and type-checked by each service's `build`
script. The user, product, and order entry points are TypeScript and run with
`tsx`; route files remain JavaScript. The shared logger is provided by
`@packages/logger`. Workspace
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


### Running the application using docker compose 
```
# Build
$ docker-compose up -d --build
#2 [product-service internal] load build definition from Dockerfile
#3 [order-service internal] load build definition from Dockerfile
#4 [user-service internal] load build definition from Dockerfile
#4 transferring dockerfile: 658B 0.0s done
#4 DONE 0.0s
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

### Service Test using Postman
```
$ curl --location 'http://localhost:82/api/products/product'
[{"id":101,"name":"Laptop","price":75000},{"id":102,"name":"Keyboard","price":3000}]

$ curl --location 'http://localhost:82/api/users/user'
[{"id":1,"name":"John","address":"123 Main St"},{"id":2,"name":"David","address":"456 Oak Ave"}]

$ curl --location 'http://localhost:82/api/orders/order'
[{"order":{"id":"1","user":{"id":5,"name":"Liam","address":"56 Maple Street"},"product":{"id":103,"name":"Mouse","price":1200},"quantity":2,"totalAmount":2400,"status":"CREATED"}}]

$ curl --location 'http://localhost:82/api/orders/order' \
--header 'Content-Type: application/json' \
--data '{"userId":7,"productId":103,"quantity":2}'

{"message":"An order already exists for this user and product","existingOrder":{"order":{"id":"1","user":{"id":7,"name":"Ava","address":"19 Willow Court"},"product":{"id":103,"name":"Mouse","price":1200},"quantity":2,"totalAmount":2400,"status":"CREATED"}}}
```

# Service logs
```
$ docker logs monorepo-nodejs-project-nginx-1

192.168.143.2 - - [22/Oct/2026:06:48:23 +0000] "GET /api/products/product HTTP/1.1" 404 159 "-" "PostmanRuntime/2.12.0"
192.168.143.2 - - [22/Oct/2026:06:48:42 +0000] "GET /api/products/product HTTP/1.1" 404 159 "-" "PostmanRuntime/2.12.0"

 
$ docker logs --tail 20 monorepo-nodejs-project-order-service-1
[INFO] HTTP GET /health 200
> order-service@1.0.0 start /app/apps/order-service
> tsx src/server.ts
```
