import express from "express";
import { corsMiddleware } from "@packages/config";
import { logger } from "@packages/logger";
import { formatDate } from "@packages/logger/formatters";
import { getAllUsers, getUserById } from "./services/userService.ts";

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
    service: "user-service",
    status: "UP"
  });
});

app.get("/users", (req, res) => {
  res.json(getAllUsers());
});

app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = getUserById(id);

  if (!user) {
    logger.warn("User lookup failed because the user was not found");
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

app.use((error, _req, _res, next) => {
  logger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  next(error);
});

app.listen(PORT, () => {
  logger.info(`User service running on port ${PORT} Service Start ${formatDate()}`);
});