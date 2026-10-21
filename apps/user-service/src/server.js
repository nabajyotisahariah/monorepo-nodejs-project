import express from "express";
import { logger } from "@packages/logger";
import { formatDate } from "@packages/logger/formatters";
import { getAllUsers, getUserById } from "./services/userService.js";

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
  res.json(getAllUsers());
});

app.get("/users/:id", (req, res) => {
  logger.info(`Fetching user with id ${req.params.id}`);
  const id = Number(req.params.id);
  const user = getUserById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

app.listen(PORT, () => {
  logger.info(`User service running on port ${PORT} Service Start ${formatDate()}`);
});