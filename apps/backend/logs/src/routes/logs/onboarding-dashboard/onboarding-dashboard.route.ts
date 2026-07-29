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
		async ({ body, organizationId, userId, set }) => {
			const result = await onboardingDashboardController({
				organizationId,
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
					"Session-authenticated. Body { apiKey }. Finds the latest onboarding test email_log for the signed-in email, sets organizationId + apikeyId, and attributes the matching activity log so it shows in workspace logs.",
			},
		},
	);
