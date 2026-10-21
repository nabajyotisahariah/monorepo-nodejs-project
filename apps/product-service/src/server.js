import express from "express";
import { corsMiddleware } from "@packages/config";
import { logger } from "@packages/logger";
import { formatDate } from "@packages/logger/formatters";
import { getAllProducts, getProductById } from "./services/productService.ts";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);

app.use((req, res, next) => {
  res.on("finish", () => {
    const route = req.route?.path;
    const path = route ? `${req.baseUrl}${route}` : "unmatched";
    logger.info(`HTTP ${req.method} ${path} ${res.statusCode}`);
  });
  next();
});

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "product-service",
    status: "UP"
  });
});

app.get("/products", (req, res) => {
  res.json(getAllProducts());
});

app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = getProductById(id);

  if (!product) {
    logger.warn("Product lookup failed because the product was not found");
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

app.use((error, _req, _res, next) => {
  logger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  next(error);
});

app.listen(PORT, () => {
  logger.info(`Product service running on port ${PORT} Service Start ${formatDate()}`);
});
