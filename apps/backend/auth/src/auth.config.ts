if (!process.env.PORT) process.env.PORT = "8000";
if (!process.env.PG_URL)
  process.env.PG_URL = "postgresql://reloop:reloop123@localhost:5432/reloop";
if (!process.env.REDIS_URL)
  process.env.REDIS_URL = "redis://:reloop123@localhost:6379";
if (!process.env.BASE_URL) process.env.BASE_URL = "https://local.reloop.sh";
if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
if (!process.env.BETTER_AUTH_SECRET)
  process.env.BETTER_AUTH_SECRET = "tENkVU4GrhckuRw4Bcfh93EWgXOFcszn";
if (!process.env.RESEND_API_KEY)
  process.env.RESEND_API_KEY = "re_FHkDu9H9_P6CGstVj4LkoeWBUEeFK65s9";
if (!process.env.EMAIL_DOMAIN)
  process.env.EMAIL_DOMAIN = "reloop.sh";
if (!process.env.GOOGLE_CLIENT_ID) process.env.GOOGLE_CLIENT_ID = "612069473337-9tlq9iqsrq6rc80ue3lebqscilu0ki01.apps.googleusercontent.com";
if (!process.env.GOOGLE_CLIENT_SECRET) process.env.GOOGLE_CLIENT_SECRET = "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";
if (!process.env.GITHUB_CLIENT_ID) process.env.GITHUB_CLIENT_ID = "Ov23lizKTih7szshbKUY";
if (!process.env.GITHUB_CLIENT_SECRET) process.env.GITHUB_CLIENT_SECRET = "f36df125339c0974f2fa1b9075fbbdb616a44cfa";

export const authConfig = {
  port: Number(process.env.PORT),
  PG_URL: process.env.PG_URL,
  REDIS_URL: process.env.REDIS_URL,
  BASE_URL: process.env.BASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
  NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_DOMAIN: process.env.EMAIL_DOMAIN,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
};
