import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { workflowConfig } from "../workflow.config";

if (workflowConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: workflowConfig.BASE_URL,
			redisUrl: workflowConfig.REDIS_URL,
			ttl: 5,
			internalSecret: workflowConfig.RELOOP_INTERNAL_SECRET,
		}),
	);
