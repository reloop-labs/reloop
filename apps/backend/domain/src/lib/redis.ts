import { RedisCache } from "@reloop/cache/redis-client";

export const redis = new RedisCache("domain", 86400); // 1 day TTL
