import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL ?? "http://localhost:3001";

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL ?? "http://localhost:3002";

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL ?? "http://localhost:3000";

// Route requests to the appropriate service.
app.use(
  "/api/users",
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/users": "",
    },
  }),
);

app.use(
  "/api/products",
  createProxyMiddleware({
    target: PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/products": "",
    },
  }),
);

app.use(
  "/api/orders",
  createProxyMiddleware({
    target: ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/orders": "",
    },
  }),
);

app.listen(80, () => {
  console.log("API Gateway listening on port 80");
});