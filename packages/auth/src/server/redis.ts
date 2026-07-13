import { RedisCache } from "@reloop/cache/redis-client";
import { authServerConfig } from "@reloop/auth/server/config";

export const redis = new RedisCache(
	"auth",
	30 * 60,
	authServerConfig.REDIS_URL,
);
