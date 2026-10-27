import express from "express";
import { logger } from "@packages/logger";
import { getAllUsers, getUserById } from "../services/userService.js";

const router = express.Router();

router.get("/health", (_req, res) => {
  logger.info("Health check requested");

  res.json({
    service: "user-service",
    status: "UP"
  });
});

router.get("/user", (_req, res) => {
  logger.info("Retrieving all users");

  res.json(getAllUsers());
});

router.get("/user/:id", (req, res) => {
  logger.info("Retrieving user by ID");
  
  const id = Number(req.params.id);
  const user = getUserById(id);

  if (!user) {
    logger.warn("User lookup failed because the user was not found");
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

export default router;
