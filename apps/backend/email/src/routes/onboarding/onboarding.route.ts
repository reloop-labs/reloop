import { validateApiKey } from "@reloop/auth/apikey/validate";
import {
	createAuthPlugin,
	createSessionCacheRedis,
	resolveSessionAuthWithProfile,
} from "@reloop/auth/middleware";
import { db } from "@reloop/db/client";
import { domain, emailLog } from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import { sendEmail } from "@reloop/email/utils/email";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { log } from "evlog";

const sessionRedis = createSessionCacheRedis(emailConfig.REDIS_URL, 5);

const ONBOARDING_TEST_LOCAL_PART = "onboarding";

/** Matches dashboard onboarding SDK snippets. */
const ONBOARDING_TEST_SUBJECT = "Hello World!";
const ONBOARDING_TEST_TEXT = "Congrats on sending your first email!";

function parseFromEmail(from: string): string {
	const angled = from.match(/<([^<>]+@[^<>]+)>/);
	return (angled?.[1] ?? from).trim();
}

function parseFromName(from: string): string | undefined {
	const displayNameMatch = from.match(/^(.+?)\s*<[^>]+>$/);
	if (!displayNameMatch?.[1]) return undefined;
	const name = displayNameMatch[1].trim().replace(/^["']|["']$/g, "");
	return name || undefined;
}

/**
 * Best-effort customer-facing log so the send shows under their workspace /
 * API key without going through the full mail `/send` domain-auth path.
 * Delivery webhooks will not attach to this row (platform transport owns the
 * real provider message id).
 */
async function insertCustomerEmailLog({
	organizationId,
	userId,
	apikeyId,
	from,
	to,
	subject,
	text,
	html,
	onboardingDomainName,
	providerMessageId,
}: {
	organizationId: string;
	userId: string;
	apikeyId?: string;
	from: string;
	to: string;
	subject: string;
	text: string;
	html: string;
	onboardingDomainName: string;
	providerMessageId?: string;
}): Promise<string | null> {
	const [domainRow] = await db
		.select({ id: domain.id })
		.from(domain)
		.where(eq(domain.domain, onboardingDomainName))
		.limit(1);

	if (!domainRow) {
		log.warn({
			domain: onboardingDomainName,
			message:
				"Onboarding test domain row missing — skip customer email_log insert",
		});
		return null;
	}

	const messageId =
		providerMessageId?.trim() ||
		`msg_onboarding_${Date.now()}_${Math.random().toString(36).slice(2)}`;

	const [row] = await db
		.insert(emailLog)
		.values({
			messageId,
			organizationId,
			domainId: domainRow.id,
			userId,
			apikeyId,
			fromEmail: parseFromEmail(from),
			fromName: parseFromName(from) ?? "Reloop",
			toEmails: [to],
			subject,
			textBody: text,
			htmlBody: html,
			status: "sent",
			provider: "kumomta",
			providerMessageId: providerMessageId?.trim() || undefined,
			size: text.length + html.length,
			sentAt: new Date(),
		})
		.returning({ id: emailLog.id });

	return row?.id ?? null;
}

export const onboardingRoute = new Elysia({
	prefix: "/v1",
	name: "OnboardingRoute",
})
	.use(
		createAuthPlugin({
			baseUrl: emailConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
		}),
	)
	/**
	 * One-click onboarding email after API key generation.
	 * Session auth + the plaintext API key from the dashboard.
	 * From: Reloop <onboarding@{ONBOARDING_TEST_DOMAIN}> → user inbox.
	 * After send, inserts email_log under the customer org + api key.
	 */
	.post(
		"/onboarding/send-test-email",
		async ({ request, body, set }) => {
			const session = await resolveSessionAuthWithProfile(
				request.headers,
				{
					baseUrl: emailConfig.BASE_URL,
					redis: sessionRedis,
					ttl: 5,
				},
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
				const keyAuth = await validateApiKey(apiKey, sessionRedis);
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

			const onboardingTestDomain =
				emailConfig.ONBOARDING_TEST_DOMAIN.trim();
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
				// Platform RELOOP_API_KEY owns ONBOARDING_TEST_DOMAIN; the user's
				// key was validated above so the button still proves their key works.
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

				let emailLogId: string | null = null;
				try {
					emailLogId = await insertCustomerEmailLog({
						organizationId: session.organizationId,
						userId: session.userId,
						apikeyId,
						from,
						to,
						subject: ONBOARDING_TEST_SUBJECT,
						text: ONBOARDING_TEST_TEXT,
						html: ONBOARDING_TEST_TEXT,
						onboardingDomainName: onboardingTestDomain,
						providerMessageId,
					});
				} catch (logError) {
					// Send already succeeded — never fail the request because of logging.
					log.error({
						error:
							logError instanceof Error
								? logError.message
								: String(logError),
						organizationId: session.organizationId,
						message: "Failed to insert customer onboarding email_log",
					});
				}

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
					"Session-authenticated. Optional body { apiKey } — when provided, the key is validated and stored on the email log. Sends from Reloop <onboarding@{ONBOARDING_TEST_DOMAIN}> to the signed-in user, then inserts email_log under their workspace.",
				tags: ["Onboarding"],
			},
		},
	);
