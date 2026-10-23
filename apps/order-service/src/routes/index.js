import express from "express";
import { logger } from "@packages/logger";
import { createOrder, getAllOrders } from "../services/orderService.js";

const router = express.Router();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";

router.get("/api/orders/health", (_req, res) => {
  res.json({
    service: "order-service",
    status: "UP"
  });
});

router.get("/api/orders/order", (_req, res) => {
  res.json(getAllOrders());
});

router.post("/api/orders/order", async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body || {};

    logger.info("Order creation requested");

    if (
      !Number.isInteger(userId) ||
      !Number.isInteger(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        message: "userId and productId must be integers, and quantity must be a positive integer"
      });
    }

    const created = await createOrder(
      userId,
      productId,
      quantity,
      USER_SERVICE_URL,
      PRODUCT_SERVICE_URL
    );

    if (created.status === "duplicate") {
      logger.warn("Order creation rejected because the order already exists");
      return res.status(409).json({
        message: "An order already exists for this user and product",
        existingOrder: created.existingOrder
      });
    }

    if (created.status === "not_found") {
      logger.warn("Order creation failed because a user or product was not found");
      return res.status(400).json({
        message: "Unable to retrieve user or product"
      });
    }

    res.status(201).json({
      order: created.createdOrder.order
    });
    logger.info("Order created");
  } catch (error) {
    logger.error(error instanceof Error ? error.stack ?? error.message : String(error));

    res.status(500).json({
      message: "Order creation failed"
    });
  }
});

export default router;
