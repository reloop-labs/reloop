export const kumomtaConfig = {
  port: Number(process.env.PORT || 8020),
  PG_URL: process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
  REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
  NODE_ENV: process.env.NODE_ENV || "development",
};
