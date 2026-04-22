// Set environment variables if not already set
if (!process.env.PG_URL)
  process.env.PG_URL = "postgresql://reloop:reloop123@localhost:5432/reloop";
if (!process.env.REDIS_URL)
  process.env.REDIS_URL = "redis://:reloop123@localhost:6379";
if (!process.env.BASE_URL) process.env.BASE_URL = "https://local.reloop.sh";

export const mailConfig = {
  port: Number(process.env.PORT || 8015),
  PG_URL: process.env.PG_URL,
  REDIS_URL: process.env.REDIS_URL,
  BASE_URL: process.env.BASE_URL,
  KUMOMTA_HTTP_URL: process.env.KUMOMTA_HTTP_URL || "http://localhost:8020",
  NODE_ENV: process.env.NODE_ENV || "development",
};
