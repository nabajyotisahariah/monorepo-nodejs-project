import express from "express";
import { logger } from "@packages/logger";
import { formatDate } from "@packages/logger/formatters";
import { getAllProducts, getProductById } from "./services/productService.ts";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "product-service",
    status: "UP"
  });
});

app.get("/products", (req, res) => {
  logger.info("Fetching all products!");
  res.json(getAllProducts());
});

app.get("/products/:id", (req, res) => {
  logger.info(`Fetching product with id ${req.params.id}`);
  const id = Number(req.params.id);
  const product = getProductById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

app.listen(PORT, () => {
  logger.info(`Product service running on port ${PORT} Service Start ${formatDate()}`);
});
