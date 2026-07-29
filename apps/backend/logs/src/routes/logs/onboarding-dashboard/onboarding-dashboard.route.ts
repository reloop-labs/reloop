import { createSessionCacheRedis } from "@reloop/auth/middleware";
import { authMiddleware } from "@reloop/logs/middleware/auth";
import { logsConfig } from "@reloop/logs/logs.config";
import { Elysia, t } from "elysia";
import { onboardingDashboardController } from "./onboarding-dashboard.controllers";

const apiKeyCache = createSessionCacheRedis(logsConfig.REDIS_URL, 5);

/**
 * Called when the user clicks "Go to Dashboard" after the onboarding test send.
 *
 * Platform transport creates email_log / activity_log under the platform org.
 * This reassigns (or inserts) them under the customer workspace + API key so
 * they appear in GET /v1/emails and GET /v1/list.
 */
export const onboardingDashboardRoute = new Elysia()
	.use(authMiddleware)
	.post(
		"/onboarding/dashboard",
		async ({ body, userId, set }) => {
			// Organization is resolved from the API key inside the controller
			// (session active org may still be an older workspace).
			const result = await onboardingDashboardController({
				userId,
				apiKey: body.apiKey.trim(),
				apiKeyCache,
			});
			set.status = result.status;
			return result.body;
		},
		{
			auth: true,
			body: t.Object({
				apiKey: t.String({ minLength: 1 }),
			}),
			detail: {
				tags: ["Logs", "Onboarding"],
				summary: "Attribute onboarding email log on Go to Dashboard",
				description:
					"Session-authenticated. Body { apiKey }. Attributes onboarding email_log + activity_log to the API key's organizationId (not the session active org).",
			},
		},
	);
