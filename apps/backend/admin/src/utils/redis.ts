import { adminConfig } from "@reloop/admin/admin.config";
import { RedisCache } from "@reloop/cache/redis-client";

export const redis = new RedisCache("admin", 86400, adminConfig.REDIS_URL);
