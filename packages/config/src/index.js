export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  userServiceUrl:
    process.env.USER_SERVICE_URL || "http://localhost:3001",
  productServiceUrl:
    process.env.PRODUCT_SERVICE_URL || "http://localhost:3002"
};

const allowedOrigins = "*";

export function corsMiddleware(req, res, next) {
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedOrigins.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.vary("Origin");
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "600");
    return res.status(204).end();
  }

  next();
}