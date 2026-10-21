export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  userServiceUrl:
    process.env.USER_SERVICE_URL || "http://localhost:3001",
  productServiceUrl:
    process.env.PRODUCT_SERVICE_URL || "http://localhost:3002"
};