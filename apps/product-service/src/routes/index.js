import express from "express";
import { logger } from "@packages/logger";
import { getAllProducts, getProductById } from "../services/productService.ts";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({
    service: "product-service",
    status: "UP"
  });
});

router.get("/products", (_req, res) => {
  res.json(getAllProducts());
});

router.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = getProductById(id);

  if (!product) {
    logger.warn("Product lookup failed because the product was not found");
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

export default router;
