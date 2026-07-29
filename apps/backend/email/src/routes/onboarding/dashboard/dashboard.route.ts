import { validateApiKey } from "@reloop/auth/apikey/validate";
import {
	createAuthPlugin,
	resolveSessionAuthWithProfile,
} from "@reloop/auth/middleware";
import { db } from "@reloop/db/client";
import { emailLog, member } from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import { attributeOnboardingActivityLog } from "@reloop/email/routes/onboarding/attribute-activity-log";
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
 * Attributes every onboarding test email_log for the signed-in user that
 * belongs to this API key (or is still unattributed) to the **API key's**
 * organization — not the session active org — so multi-org users land logs
 * on the workspace that owns the key.
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
				{ requireOrg: false },
			);

			if (!session?.userId) {
				set.status = 401;
				return {
					message: "Authentication required",
					why: "You must be signed in.",
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

			// Org comes from the key — session active org may still be an older workspace.
			const organizationId = keyAuth.organizationId;

			const [membership] = await db
				.select({ id: member.id })
				.from(member)
				.where(
					and(
						eq(member.userId, session.userId),
						eq(member.organizationId, organizationId),
					),
				)
				.limit(1);

			if (!membership) {
				set.status = 403;
				return {
					message: "API key does not belong to your account",
					why: "You are not a member of the workspace that owns this API key.",
					fix: "Use the API key generated for a workspace you belong to.",
				};
			}

			try {
				// Candidate onboarding rows for this user email.
				// We only claim a row when it is already under this key/org, has no
				// apikey yet, or lives on an org the user is NOT a member of
				// (platform transport). That way multi-org users never steal logs
				// from their other workspaces.
				const candidates = await db
					.select({
						id: emailLog.id,
						organizationId: emailLog.organizationId,
						apikeyId: emailLog.apikeyId,
						fromEmail: emailLog.fromEmail,
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

				const userMemberships = await db
					.select({ organizationId: member.organizationId })
					.from(member)
					.where(eq(member.userId, session.userId));
				const memberOrgIds = new Set(
					userMemberships.map((m) => m.organizationId),
				);

				const matches = candidates.filter((row) => {
					if (row.organizationId === organizationId) return true;
					if (row.apikeyId === keyAuth.apiKeyId) return true;
					if (!row.apikeyId) return true;
					// Platform (or unknown) org — user is not a member there.
					return !memberOrgIds.has(row.organizationId);
				});

				const ids: string[] = [];
				let updatedCount = 0;

				for (const match of matches) {
					const alreadyOwned =
						match.organizationId === organizationId &&
						match.apikeyId === keyAuth.apiKeyId;

					if (!alreadyOwned) {
						await db
							.update(emailLog)
							.set({
								organizationId,
								apikeyId: keyAuth.apiKeyId,
								userId: session.userId,
							})
							.where(eq(emailLog.id, match.id));
						updatedCount += 1;
					}

					// Reassign / insert activity_log so the Logs page shows email.sent.
					await attributeOnboardingActivityLog({
						emailLogId: match.id,
						organizationId,
						userId: session.userId,
						apikeyId: keyAuth.apiKeyId,
						to,
						from: match.fromEmail,
						subject: ONBOARDING_TEST_SUBJECT,
					});

					ids.push(match.id);
				}

				if (ids.length === 0) {
					log.warn({
						email: to,
						organizationId,
						message:
							"No onboarding email_log found to reassign on dashboard handoff",
					});
					return {
						object: "onboarding.dashboard",
						updated: false,
						reason: "email_log_not_found",
						organizationId,
						apikeyId: keyAuth.apiKeyId,
						count: 0,
						ids: [],
					};
				}

				return {
					object: "onboarding.dashboard",
					updated: updatedCount > 0,
					organizationId,
					apikeyId: keyAuth.apiKeyId,
					count: ids.length,
					ids,
				};
			} catch (error) {
				log.error({
					error: error instanceof Error ? error.message : String(error),
					organizationId,
					email: to,
					message: "Failed to reassign onboarding email_logs",
				});
				set.status = 200;
				return {
					object: "onboarding.dashboard",
					updated: false,
					reason: "update_failed",
					organizationId,
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
					"Session-authenticated. Body { apiKey }. Attributes onboarding email_log rows to the API key's organizationId (not the session active org). Supports multi-org users and multiple sends.",
				tags: ["Onboarding"],
			},
		},
	);
