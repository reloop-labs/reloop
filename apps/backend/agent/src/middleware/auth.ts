import { agentConfig } from "@be/agent/agent.config";
import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";

export const authMiddleware = new Elysia({ name: "agent-auth-middleware" }).use(
	createAuthPlugin({
		baseUrl: agentConfig.BASE_URL,
		redisUrl: agentConfig.REDIS_URL,
		internalSecret: agentConfig.RELOOP_INTERNAL_SECRET,
	}),
);
