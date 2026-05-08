import { RedisCache } from "@reloop/cache/redis-client";
import { emailConfig } from "../email.config";

export const redis = new RedisCache("email", 30 * 60, emailConfig.REDIS_URL);
