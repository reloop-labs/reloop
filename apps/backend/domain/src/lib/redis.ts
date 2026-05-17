import { domainConfig } from "@reloop/domain/domain.config";
import { RedisCache } from "@reloop/cache/redis-client";

export const redis = new RedisCache("domain", 86400, domainConfig.REDIS_URL);
