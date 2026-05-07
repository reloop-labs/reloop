import { logsConfig } from "@reloop/logs/logs.config";
import { Elysia } from "elysia";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

if (logsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" }).macro({
	insertAuth: {
		async resolve({ status, request: { headers } }) {
			try {
				const apiKey =

					headers.get("x-api-key") ||
					headers.get("authorization")?.replace("Bearer ", "");
				const cookie = headers.get("cookie");
				const traceId = crypto.randomUUID();
				const apiKeyResult = await validateApiKey(apiKey);
				if (apiKeyResult) return { ...apiKeyResult, traceId };
				const sessionResult = await validateSession(cookie);
				if (sessionResult) return { ...sessionResult, traceId };
				return status(401, { message: "Authentication required" });
			} catch {
				return status(401, { message: "Authentication failed" });
			}
		},
	},
	auth: {
		async resolve({ status, request: { headers } }) {
			try {
				const apiKey =
					headers.get("x-api-key") ||
					headers.get("authorization")?.replace("Bearer ", "");
				const cookie = headers.get("cookie");
				const traceId = crypto.randomUUID();
				const apiKeyResult = await validateApiKey(apiKey);
				if (apiKeyResult) return { ...apiKeyResult, traceId };
				const sessionResult = await validateSession(cookie);
				if (sessionResult) return { ...sessionResult, traceId };
				return status(401, { message: "Authentication required" });
			} catch {
				return status(401, { message: "Authentication failed" });
			}
		},
		detail: {
			security: [{ apiKey: [] }],
		},
	},
});
