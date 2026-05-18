import { RedisCache } from "@reloop/cache/redis-client";
import { domainConfig } from "@reloop/domain/domain.config";

export const redis = new RedisCache("domain", 86400, domainConfig.REDIS_URL);
