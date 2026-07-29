import { validateApiKey } from "@reloop/auth/apikey/validate";
import {
	createAuthPlugin,
	resolveSessionAuthWithProfile,
} from "@reloop/auth/middleware";
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
import { Elysia, t } from "elysia";

/**
 * One-click onboarding email after API key generation.
 * Session auth + the plaintext API key from the dashboard.
 * From: Reloop <onboarding@{ONBOARDING_TEST_DOMAIN}> → user inbox.
 * Each successful send attributes (or inserts) one customer email_log.
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

			// Onboarding always sends the generated key so we can prove it is valid.
			// Home "send first email" may omit it (no plaintext key available).
			const apiKey = body?.apiKey?.trim() ?? "";
			let apikeyId: string | undefined;
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

				if (keyAuth.organizationId !== session.organizationId) {
					set.status = 403;
					return {
						message: "API key does not belong to this workspace",
						why: "The key must belong to your active organization.",
						fix: "Use the API key generated for this workspace.",
					};
				}
				apikeyId = keyAuth.apiKeyId;
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

				// One customer-facing log per send so multiple sends all appear.
				const emailLogId = await saveOnboardingCustomerEmailLog({
					organizationId: session.organizationId,
					userId: session.userId,
					apikeyId,
					from,
					to,
					onboardingDomainName: onboardingTestDomain,
					providerMessageId,
				});

				return {
					object: "email",
					event: "email.sent",
					mode: "onboarding_test",
					to,
					from,
					domain: onboardingTestDomain,
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
					"Session-authenticated. Optional body { apiKey } — when provided, the key is validated and stored on a new email_log for this send. Sends from Reloop <onboarding@{ONBOARDING_TEST_DOMAIN}> via the platform key. Each call saves a separate log under the customer workspace.",
				tags: ["Onboarding"],
			},
		},
	);
