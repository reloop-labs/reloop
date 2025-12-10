import { RedisCache } from "@reloop/cache/redis-client";
import { authConfig } from "../auth.config";
export const redis = new RedisCache("auth", 30 * 60, authConfig.REDIS_URL);
