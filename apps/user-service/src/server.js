import express from "express";
import { logger } from "@packages/logger";
import { formatDate } from "@packages/logger/formatters";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "user-service",
    status: "UP"
  });
});

app.get("/users", (req, res) => {

  logger.info("Fetching all users");
  res.json([
    {
      id: 1,
      name: "John"
    },
    {
      id: 2,
      name: "David"
    }
  ]);
});

app.get("/users/:id", (req, res) => {

  logger.info(`Fetching user with id ${req.params.id}`);
  const id = Number(req.params.id);

  res.json({
    id,
    name: `User ${id}`
  });
});

app.listen(PORT, () => {
  logger.info(`User service running on port ${PORT} Service Start ${formatDate()}`);
});