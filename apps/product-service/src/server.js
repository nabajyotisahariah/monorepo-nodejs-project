import express from "express";
import { logger } from "@packages/logger";
import { formatDate } from "@packages/logger/formatters";

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
  res.json([
    {
      id: 101,
      name: "Laptop",
      price: 75000
    },
    {
      id: 102,
      name: "Keyboard",
      price: 3000
    }
  ]);
});

app.get("/products/:id", (req, res) => {
  
  logger.info(`Fetching product with id ${req.params.id}`);
  const id = Number(req.params.id);

  res.json({
    id,
    name: `Product ${id}`,
    price: 1000
  });
});

app.listen(PORT, () => {
  logger.info(`Product service running on port ${PORT} Service Start ${formatDate()}`);
});
