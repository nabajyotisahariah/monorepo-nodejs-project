import express from "express";
import { logger } from "@packages/logger";
//import {config} from "@packages/config";
import { formatDate } from "@packages/logger/formatters";
import { createOrder, getAllOrders } from "./services/orderService.ts";

const app = express();

const PORT = process.env.PORT || 3000;

//const USER_SERVICE_URL = config.userServiceUrl;
//const PRODUCT_SERVICE_URL = config.productServiceUrl;
// console.log("USER_SERVICE_URL", process.env.USER_SERVICE_URL);
// console.log("PRODUCT_SERVICE_URL", process.env.PRODUCT_SERVICE_URL);

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";

console.log("USER_SERVICE_URL", USER_SERVICE_URL," PRODUCT_SERVICE_URL", PRODUCT_SERVICE_URL, " Order Service PORT", PORT);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "order-service",
    status: "UP"
  });
});

app.get("/orders", (req, res) => {
  res.json(getAllOrders());
});


app.post("/orders", async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    logger.info(`Creating order for user ${userId} and product ${productId} with quantity ${quantity}`);  
    const created = await createOrder(
      userId,
      productId,
      quantity,
      USER_SERVICE_URL,
      PRODUCT_SERVICE_URL
    );

    if (!created) {
      return res.status(400).json({
        message: "Unable to retrieve user or product"
      });
    }

    res.status(201).json({
      user: created.user,
      product: created.product,
      quantity,
      totalAmount: created.order.totalAmount
    });

  } catch (error) {

    logger.error(error);

    res.status(500).json({
      message: "Order creation failed"
    });
  }
});

app.listen(PORT, () => {
  logger.info(`Order service running on port ${PORT} Service Start ${formatDate()}`);
});