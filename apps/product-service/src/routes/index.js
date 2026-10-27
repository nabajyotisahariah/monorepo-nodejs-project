import express from "express";
import { logger } from "@packages/logger";
import { getAllProducts, getProductById } from "../services/productService.js";

const router = express.Router();

router.get("/health", (_req, res) => {
  logger.info("Health check requested");

  res.json({
    service: "product-service",
    status: "UP"
  });
});

router.get("/product", (_req, res) => {
  logger.info("Retrieving all products");

  res.json(getAllProducts());
});

router.get("/product/:id", (req, res) => {
  logger.info("Retrieving product by ID");

  const id = Number(req.params.id);
  const product = getProductById(id);

  if (!product) {
    logger.warn("Product lookup failed because the product was not found");
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

export default router;
