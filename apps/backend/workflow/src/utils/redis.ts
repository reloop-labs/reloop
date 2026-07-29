import { workflowConfig } from "@be/workflow/workflow.config";
import { RedisCache } from "@reloop/cache/redis-client";

/** Shared workflow Redis client (rate limits, health, etc.). */
export const redis = new RedisCache(
	"workflow",
	86400,
	workflowConfig.REDIS_URL,
);
