import express from "express";
import type { NextFunction, Request, Response } from "express";
import { corsMiddleware } from "@packages/config";
import { logger } from "@packages/logger";
import { formatDate } from "@packages/logger/formatters";
import routes from "./routes/index.js";

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
app.use(routes);

app.use((error: unknown, _req: Request, _res: Response, next: NextFunction) => {
  logger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  next(error);
});

app.listen(PORT, () => {
  logger.info(`User service running on port ${PORT} Service Start ${formatDate()}`);
});
