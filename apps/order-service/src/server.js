import express from "express";
import { corsMiddleware } from "@packages/config";
import { logger } from "@packages/logger";
//import {config} from "@packages/config";
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

app.use((error, _req, _res, next) => {
  logger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  next(error);
});

app.listen(PORT, () => {
  logger.info(`Order service running on port ${PORT} Service Start ${formatDate()}`);
});