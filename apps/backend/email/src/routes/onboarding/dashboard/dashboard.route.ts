import { validateApiKey } from "@reloop/auth/apikey/validate";
import {
	createAuthPlugin,
	resolveSessionAuthWithProfile,
} from "@reloop/auth/middleware";
import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import { ONBOARDING_TEST_SUBJECT } from "@reloop/email/routes/onboarding/onboarding.constants";
import {
	onboardingSessionOpts,
	onboardingSessionRedis,
} from "@reloop/email/routes/onboarding/onboarding.session";
import { and, desc, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { log } from "evlog";

/**
 * Called when the user clicks "Go to Dashboard" after the onboarding test send.
 *
 * Platform transport creates email_log under the platform org (RELOOP_API_KEY).
 * This reassigns the matching row (to = signed-in email, onboarding subject)
 * to the customer workspace + their API key so it appears in their logs.
 */
export const dashboardRoute = new Elysia({
	name: "OnboardingDashboardRoute",
})
	.use(
		createAuthPlugin({
			baseUrl: emailConfig.BASE_URL,
			redis: onboardingSessionRedis,
			ttl: 5,
		}),
	)
	.post(
		"/onboarding/dashboard",
		async ({ request, body, set }) => {
			const session = await resolveSessionAuthWithProfile(
				request.headers,
				onboardingSessionOpts,
				{ requireOrg: true },
			);

			if (!session?.organizationId || !session.userId) {
				set.status = 401;
				return {
					message: "Authentication required",
					why: "You must be signed in with an active workspace.",
				};
			}

			const to = session.userEmail?.trim();
			if (!to) {
				set.status = 400;
				return {
					message: "No email on your account",
					why: "Your signed-in user has no email address.",
					fix: "Update your profile email, then try again.",
				};
			}

			const apiKey = body?.apiKey?.trim() ?? "";
			if (!apiKey) {
				set.status = 400;
				return {
					message: "API key required",
					why: "Pass the onboarding API key so we can attribute the log to it.",
					fix: "Include body { apiKey } from the key generated in onboarding.",
				};
			}

			const keyAuth = await validateApiKey(apiKey, onboardingSessionRedis);
			if (!keyAuth) {
				set.status = 401;
				return {
					message: "Invalid API key",
					why: "That API key is missing, disabled, expired, or malformed.",
					fix: "Use the key generated during onboarding.",
				};
			}

			if (keyAuth.organizationId !== session.organizationId) {
				set.status = 403;
				return {
					message: "API key does not belong to this workspace",
					why: "The key must belong to your active organization.",
					fix: "Use the API key generated for this workspace.",
				};
			}

			try {
				// Most recent onboarding test send delivered to this user.
				// Platform send owns the row until we reassign it here.
				const [match] = await db
					.select({
						id: emailLog.id,
						organizationId: emailLog.organizationId,
						apikeyId: emailLog.apikeyId,
					})
					.from(emailLog)
					.where(
						and(
							eq(emailLog.subject, ONBOARDING_TEST_SUBJECT),
							sql`${emailLog.toEmails} @> ${JSON.stringify([to])}::jsonb`,
						),
					)
					.orderBy(desc(emailLog.createdAt))
					.limit(1);

				if (!match) {
					log.warn({
						email: to,
						organizationId: session.organizationId,
						message:
							"No onboarding email_log found to reassign on dashboard handoff",
					});
					return {
						object: "onboarding.dashboard",
						updated: false,
						reason: "email_log_not_found",
						organizationId: session.organizationId,
						apikeyId: keyAuth.apiKeyId,
					};
				}

				const alreadyOwned =
					match.organizationId === session.organizationId &&
					match.apikeyId === keyAuth.apiKeyId;

				if (alreadyOwned) {
					return {
						object: "onboarding.dashboard",
						updated: false,
						reason: "already_attributed",
						id: match.id,
						organizationId: session.organizationId,
						apikeyId: keyAuth.apiKeyId,
					};
				}

				const [updated] = await db
					.update(emailLog)
					.set({
						organizationId: session.organizationId,
						apikeyId: keyAuth.apiKeyId,
						userId: session.userId,
					})
					.where(eq(emailLog.id, match.id))
					.returning({ id: emailLog.id });

				return {
					object: "onboarding.dashboard",
					updated: true,
					id: updated?.id ?? match.id,
					organizationId: session.organizationId,
					apikeyId: keyAuth.apiKeyId,
				};
			} catch (error) {
				log.error({
					error: error instanceof Error ? error.message : String(error),
					organizationId: session.organizationId,
					email: to,
					message: "Failed to reassign onboarding email_log",
				});
				// Do not block "Go to Dashboard" — attribution is best-effort.
				set.status = 200;
				return {
					object: "onboarding.dashboard",
					updated: false,
					reason: "update_failed",
					organizationId: session.organizationId,
					apikeyId: keyAuth.apiKeyId,
				};
			}
		},
		{
			authSession: true,
			body: t.Object({
				apiKey: t.String({ minLength: 1 }),
			}),
			detail: {
				summary: "Attribute onboarding email log on Go to Dashboard",
				description:
					"Session-authenticated. Body { apiKey }. Finds the latest onboarding test email_log for the signed-in email and sets organizationId + apikeyId to the customer workspace.",
				tags: ["Onboarding"],
			},
		},
	);
