// Set environment variables if not already set
if (!process.env.PORT) process.env.PORT = "3015";
if (!process.env.PG_URL)
  process.env.PG_URL = "postgresql://reloop:reloop123@localhost:5432/reloop";
if (!process.env.REDIS_URL)
  process.env.REDIS_URL = "redis://:reloop123@localhost:6379";
if (!process.env.BASE_URL) process.env.BASE_URL = "https://reloop.local";
if (!process.env.KUMOMTA_HTTP_URL)
  process.env.KUMOMTA_HTTP_URL = "http://localhost:8000";
if (!process.env.SMTP_USER) process.env.SMTP_USER = "reloop";
if (!process.env.SMTP_PASS) process.env.SMTP_PASS = "reloop123";

export const mailConfig = {
  port: Number(process.env.PORT),
  PG_URL: process.env.PG_URL,
  REDIS_URL: process.env.REDIS_URL,
  BASE_URL: process.env.BASE_URL,
  KUMOMTA_HTTP_URL: process.env.KUMOMTA_HTTP_URL,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  NODE_ENV: process.env.NODE_ENV || "development",
};
