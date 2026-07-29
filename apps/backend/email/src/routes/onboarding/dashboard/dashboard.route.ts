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
 * Attributes every onboarding test email_log for the signed-in user
 * (multiple sends → multiple rows) to the customer workspace + API key.
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
				// All onboarding test sends to this user (multiple sends → many rows).
				const matches = await db
					.select({
						id: emailLog.id,
						organizationId: emailLog.organizationId,
						apikeyId: emailLog.apikeyId,
					})
					.from(emailLog)
					.where(
						and(
							eq(emailLog.subject, ONBOARDING_TEST_SUBJECT),
							sql`EXISTS (
								SELECT 1
								FROM jsonb_array_elements_text(${emailLog.toEmails}) AS addr(email)
								WHERE lower(addr.email) = lower(${to})
							)`,
						),
					)
					.orderBy(desc(emailLog.createdAt));

				const ids: string[] = [];
				let updatedCount = 0;

				for (const match of matches) {
					const alreadyOwned =
						match.organizationId === session.organizationId &&
						match.apikeyId === keyAuth.apiKeyId;

					if (!alreadyOwned) {
						await db
							.update(emailLog)
							.set({
								organizationId: session.organizationId,
								apikeyId: keyAuth.apiKeyId,
								userId: session.userId,
							})
							.where(eq(emailLog.id, match.id));
						updatedCount += 1;
					}
					ids.push(match.id);
				}

				if (ids.length === 0) {
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
						count: 0,
						ids: [],
					};
				}

				return {
					object: "onboarding.dashboard",
					updated: updatedCount > 0,
					organizationId: session.organizationId,
					apikeyId: keyAuth.apiKeyId,
					count: ids.length,
					ids,
				};
			} catch (error) {
				log.error({
					error: error instanceof Error ? error.message : String(error),
					organizationId: session.organizationId,
					email: to,
					message: "Failed to reassign onboarding email_logs",
				});
				set.status = 200;
				return {
					object: "onboarding.dashboard",
					updated: false,
					reason: "update_failed",
					organizationId: session.organizationId,
					apikeyId: keyAuth.apiKeyId,
					count: 0,
					ids: [],
				};
			}
		},
		{
			authSession: true,
			body: t.Object({
				apiKey: t.String({ minLength: 1 }),
			}),
			detail: {
				summary: "Attribute onboarding email logs on Go to Dashboard",
				description:
					"Session-authenticated. Body { apiKey }. Attributes every onboarding test email_log for the signed-in email to the customer workspace + API key (supports multiple sends).",
				tags: ["Onboarding"],
			},
		},
	);
