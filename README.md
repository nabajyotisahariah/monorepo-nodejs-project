# Node.js E-commerce Microservices Monorepo

A pnpm workspace containing an API gateway, user, product, and order services,
and shared configuration, model, and logger packages. The order service
retrieves user and product data from their services when creating an order.
Orders are stored in memory and are lost when the order service restarts.

## Workspace layout

```text
apps/
  api-gateway/        TypeScript API gateway
  user-service/       User API
  product-service/    Product API
  order-service/      Order API and user/product service calls
packages/
  config/             Shared environment configuration
  model/              Shared User, Product, and Order types
  logger/             Shared logger and date formatter
nginx/                Nginx reverse-proxy configuration
helm/
  ecommerce1.1-gce/   Helm chart for GCE Ingress
  ecommerce1.1-nginx/ Helm chart for Nginx Ingress
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

The gateway uses nodemon to restart when its TypeScript source changes; the
other services use `tsx watch`. The order service's development script points
to the local user and product services at `http://localhost:3001` and
`http://localhost:3002`.

To build and start the workspace:

```sh
pnpm build
pnpm start
```

Each service's build writes JavaScript to its `dist/` folder, and its start
script runs `dist/server.js`.

## Services and API

| Service | Local URL | Routes |
| --- | --- | --- |
| API Gateway | `http://localhost:82` | `/api/users`, `/api/products`, `/api/orders` |
| User | `http://localhost:3001` | `GET /health`, `GET /user`, `GET /user/:id` |
| Product | `http://localhost:3002` | `GET /health`, `GET /product`, `GET /product/:id` |
| Order | `http://localhost:3003` | `GET /health`, `GET /order`, `POST /order` |

The gateway forwards the path after each prefix to the corresponding service.
For example, the user list is available directly at
`http://localhost:3001/user` or through the gateway at
`http://localhost:82/api/users/user`.

Check service health and list users or products:

```sh
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

curl http://localhost:3001/user
curl http://localhost:3002/product
```

Create an order with integer `userId` and `productId` values. `quantity` is
optional and defaults to `1`; it must be a positive integer when supplied.
For example:

```sh
curl -X POST http://localhost:3003/order \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"productId\":101,\"quantity\":2}"
```

The gateway can be used instead of calling the order service directly:

```sh
curl -X POST http://localhost:82/api/orders/order \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"productId\":101,\"quantity\":2}"

curl http://localhost:82/api/orders/order
```

A successful order request returns `201` with the order's resolved user and
product, quantity, total amount, and status. Invalid input returns `400`; a
missing user or product also returns `400`. Creating another order for the
same user and product returns `409`.

## Docker Compose

Build and start the services and Nginx gateway:

```sh
docker compose up --build -d
```

The gateway is available at `http://localhost:82`. For example, check its
health and request the user list through it:

```sh
curl http://localhost:82/health
curl http://localhost:82/api/users/user
```

View logs or stop the services with:

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

For the environment-driven Compose configuration, provide the required
`USER_SERVICE_URL`, `PRODUCT_SERVICE_URL`, and `ORDER_SERVICE_URL` values in a
`.env` file and start that Compose file explicitly:

```sh
docker compose --env-file .env -f docker-compose-env.yml up --build -d
```

## Kubernetes with Helm

Choose the chart matching your cluster's Ingress controller:

- `helm/ecommerce1.1-gce` for GCE Ingress
- `helm/ecommerce1.1-nginx` for Nginx Ingress

Update the image registry and tags in the chosen chart's `values.yaml`, then
lint and install it. For example, with GCE Ingress:

```sh
helm lint ./helm/ecommerce1.1-gce/
helm install ecommerce ./helm/ecommerce1.1-gce/
```

Remove the release with:

```sh
helm uninstall ecommerce1.1
```

### GCE Ingress public IP and service URLs

The GCE chart creates an external HTTP(S) load balancer. After the ingress is
provisioned, get its public IP with:

```sh
kubectl get ingress microservices-ingress
```

Use the address shown in the `ADDRESS` column to reach the services. The GCE
Ingress forwards request paths unchanged, so the chart routes these native
service paths:

| Service | URL |
| --- | --- |
| User | `http://<INGRESS_IP>/api/users` and `http://<INGRESS_IP>/api/users/user/<id>` |
| Product | `http://<INGRESS_IP>/api/products/product` and `http://<INGRESS_IP>/api/products/product/<id>` |
| Order | `http://<INGRESS_IP>/api/orders/order` |

The order endpoint accepts `POST` requests with `userId`, `productId`, and an
optional `quantity` JSON field. The Kubernetes services remain `ClusterIP`;
external traffic enters through the ingress load balancer.

By default GCE assigns an ephemeral public IP. To keep a stable IP, reserve a
global address and set its resource name as `ingress.staticIpName` in
`helm/ecommerce1.1-gce/values.yaml` before installing or upgrading the chart:

```sh
gcloud compute addresses create ecommerce-ingress-ip --global
gcloud compute addresses describe ecommerce-ingress-ip --global --format="get(address)"
# Set ingress.staticIpName to ecommerce-ingress-ip in values.yaml
helm upgrade --install ecommerce ./helm/ecommerce1.1-gce/
kubectl get ingress microservices-ingress
```

The `gcloud` command prints the reserved public IP; the ingress `ADDRESS` is
the address to use for the service URLs above.

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
| `pnpm dev` | Run workspace development scripts in parallel |
| `pnpm build` | Build each workspace package that defines a build script |
| `pnpm start` | Run workspace start scripts in parallel |
| `pnpm lint` | Run service lint scripts |
| `pnpm test` | Run automated service tests |

User, product, and order service tests use Node's built-in test runner through
`tsx`. They cover catalog lookups and order creation, duplicate detection, and
missing user or product responses.

 ### Google Cloud Compute Engine Logs
 Google Cloud Ops Agent on Compute Engine VMs (such as instance-ec2 in your project) only collects standard system logs (like /var/log/syslog and /var/log/messages) and does not automatically harvest logs from container runtimes like Docker.

 Configure Docker to use the gcplogs Logging Driver (Alternative)
Alternatively, you can instruct the Docker daemon to native-stream all logs directly to Google Cloud Logging by using Google's native logging driver.

Create or edit /etc/docker/daemon.json on the VM:
{
  "log-driver": "gcplogs"
}

Restart the Docker service (this will temporarily stop running containers):

sudo systemctl restart docker
