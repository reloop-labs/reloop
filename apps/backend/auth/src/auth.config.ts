// Default values for auth configuration


if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = "redis://:reloop123@localhost:6379"
}

const defaults = {
  PORT: "8000",
  PG_URL: "postgresql://reloop:reloop123@localhost:5432/reloop",
  REDIS_URL: "redis://:reloop123@localhost:6379",
  BASE_URL: "https://local.reloop.sh",
  NODE_ENV: "development",
  NODE_TLS_REJECT_UNAUTHORIZED: "0",
  BETTER_AUTH_SECRET: "tENkVU4GrhckuRw4Bcfh93EWgXOFcszn",
  EMAIL_DOMAIN: "reloop.sh",
  GOOGLE_CLIENT_ID: "612069473337-9tlq9iqsrq6rc80ue3lebqscilu0ki01.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "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",
  GITHUB_CLIENT_ID: "Ov23lizKTih7szshbKUY",
  GITHUB_CLIENT_SECRET: "f36df125339c0974f2fa1b9075fbbdb616a44cfa",
} as const;

export const authConfig = {
  port: Number(process.env.PORT || defaults.PORT),
  PG_URL: process.env.PG_URL || defaults.PG_URL,
  REDIS_URL: process.env.REDIS_URL,
  BASE_URL: process.env.BASE_URL || defaults.BASE_URL,
  NODE_ENV: process.env.NODE_ENV || defaults.NODE_ENV,
  NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || defaults.NODE_TLS_REJECT_UNAUTHORIZED,
  EMAIL_DOMAIN: process.env.EMAIL_DOMAIN || defaults.EMAIL_DOMAIN,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || defaults.BETTER_AUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || defaults.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || defaults.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || defaults.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || defaults.GITHUB_CLIENT_SECRET,
};
