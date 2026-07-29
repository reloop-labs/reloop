import { validateApiKey } from "@reloop/auth/apikey/validate";
import {
	createAuthPlugin,
	resolveSessionAuthWithProfile,
} from "@reloop/auth/middleware";
import { db } from "@reloop/db/client";
import { member } from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import {
	ONBOARDING_TEST_LOCAL_PART,
	ONBOARDING_TEST_SUBJECT,
	ONBOARDING_TEST_TEXT,
} from "@reloop/email/routes/onboarding/onboarding.constants";
import {
	onboardingSessionOpts,
	onboardingSessionRedis,
} from "@reloop/email/routes/onboarding/onboarding.session";
import { saveOnboardingCustomerEmailLog } from "@reloop/email/routes/onboarding/send-test-email/customer-email-log";
import { sendEmail } from "@reloop/email/utils/email";
import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

/**
 * One-click onboarding email after API key generation.
 * Session auth + the plaintext API key from the dashboard.
 * From: Reloop <onboarding@{ONBOARDING_TEST_DOMAIN}> → user inbox.
 * Each successful send attributes (or inserts) one customer email_log
 * under the API key's organization (not the session active org).
 */
export const sendTestEmailRoute = new Elysia({
	name: "OnboardingSendTestEmailRoute",
})
	.use(
		createAuthPlugin({
			baseUrl: emailConfig.BASE_URL,
			redis: onboardingSessionRedis,
			ttl: 5,
		}),
	)
	.post(
		"/onboarding/send-test-email",
		async ({ request, body, set }) => {
			// Session identifies the user; org for logging comes from the API key
			// so multi-org users (new workspace while another is still active)
			// attribute to the key's org, not the session's activeOrganizationId.
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

			// Onboarding always sends the generated key so we can prove it is valid
			// and resolve the correct workspace for the email_log.
			const apiKey = body?.apiKey?.trim() ?? "";
			let apikeyId: string | undefined;
			let organizationId: string | undefined;

			if (apiKey) {
				const keyAuth = await validateApiKey(apiKey, onboardingSessionRedis);
				if (!keyAuth) {
					set.status = 401;
					return {
						message: "Invalid API key",
						why: "That API key is missing, disabled, expired, or malformed.",
						fix: "Copy the key shown on this page (or generate a new one) and try again.",
					};
				}

				// Key may belong to a newly created org while session still points
				// at an older active org — do not compare to session.organizationId.
				const [membership] = await db
					.select({ id: member.id })
					.from(member)
					.where(
						and(
							eq(member.userId, session.userId),
							eq(member.organizationId, keyAuth.organizationId),
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

				apikeyId = keyAuth.apiKeyId;
				organizationId = keyAuth.organizationId;
			}

			const onboardingTestDomain = emailConfig.ONBOARDING_TEST_DOMAIN.trim();
			if (!onboardingTestDomain) {
				set.status = 503;
				return {
					message: "Onboarding test domain not configured",
					why: "ONBOARDING_TEST_DOMAIN is not set on this deployment.",
					fix: "Set ONBOARDING_TEST_DOMAIN (e.g. reloop.email) and restart the email service.",
				};
			}

			const to = session.userEmail?.trim();
			if (!to) {
				set.status = 400;
				return {
					message: "No email on your account",
					why: "Your signed-in user has no email address to deliver to.",
					fix: "Update your profile email, then try again.",
				};
			}

			// Display name + address — matches product expectation:
			// Reloop <onboarding@{ONBOARDING_TEST_DOMAIN}>
			const from = `Reloop <${ONBOARDING_TEST_LOCAL_PART}@${onboardingTestDomain}>`;
			try {
				const result = await sendEmail({
					from,
					to,
					subject: ONBOARDING_TEST_SUBJECT,
					text: ONBOARDING_TEST_TEXT,
					html: ONBOARDING_TEST_TEXT,
				});

				const resultObj =
					result && typeof result === "object"
						? (result as Record<string, unknown>)
						: null;
				const providerMessageId =
					typeof resultObj?.messageId === "string"
						? resultObj.messageId
						: typeof resultObj?.id === "string"
							? resultObj.id
							: undefined;

				// Log under the API key's org when present (multi-org safe).
				let emailLogId: string | null = null;
				if (organizationId) {
					emailLogId = await saveOnboardingCustomerEmailLog({
						organizationId,
						userId: session.userId,
						apikeyId,
						from,
						to,
						onboardingDomainName: onboardingTestDomain,
						providerMessageId,
					});
				}

				return {
					object: "email",
					event: "email.sent",
					mode: "onboarding_test",
					to,
					from,
					domain: onboardingTestDomain,
					...(organizationId ? { organizationId } : {}),
					...(emailLogId ? { id: emailLogId } : {}),
					...(resultObj ?? {}),
				};
			} catch (error) {
				set.status = 500;
				return {
					message: "Failed to send email",
					why: error instanceof Error ? error.message : String(error),
					fix: "Check ONBOARDING_TEST_DOMAIN and mail delivery, then try again.",
				};
			}
		},
		{
			authSession: true,
			body: t.Object({
				apiKey: t.Optional(t.String({ minLength: 1 })),
			}),
			detail: {
				summary: "Onboarding test email to signed-in user",
				description:
					"Session-authenticated. Optional body { apiKey } — when provided, the key is validated and the email_log is attributed to the key's organizationId (not the session active org). Sends from Reloop <onboarding@{ONBOARDING_TEST_DOMAIN}> via the platform key.",
				tags: ["Onboarding"],
			},
		},
	);
