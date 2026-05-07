import { templateConfig } from "@be/template/template.config";
import { RedisCache } from "@reloop/cache/redis-client";

export const redis = new RedisCache(
	"template",
	86400,
	templateConfig.REDIS_URL,
);
