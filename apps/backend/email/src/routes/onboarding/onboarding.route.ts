import {
	createAuthPlugin,
	createSessionCacheRedis,
	resolveSessionAuthWithProfile,
} from "@reloop/auth/middleware";
import { db } from "@reloop/db/client";
import { organization } from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import OnboardingTestEmail from "@reloop/email/emails/onboarding-test";
import { render } from "@reloop/email/render";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import React from "react";

const sessionRedis = createSessionCacheRedis(emailConfig.REDIS_URL, 5);

function buildPlatformFromAddress({
	localPart,
	domainName,
	fromName,
}: {
	localPart: string;
	domainName: string;
	fromName?: string | null;
}): string {
	const address = `${localPart}@${domainName}`;
	const name = fromName?.trim();
	if (!name) return address;
	const safeName = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
	return `"${safeName}" <${address}>`;
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
	 * One-click platform test email after API key generation.
	 * Session auth required. Prefer the just-generated API key via `x-api-key`
	 * so inject + logs attribute the Onboarding Key.
	 *
	 * - From: onboarding@<PLATFORM_TEST_FROM_DOMAIN> (display name = workspace)
	 * - To: signed-in user email only
	 * - Body: onboarding-test template (platform mode)
	 */
	.post(
		"/onboarding/send-test-email",
		async ({ request, set }) => {
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

			if (!emailConfig.PLATFORM_TEST_ENABLED) {
				set.status = 403;
				return {
					message: "Platform test email disabled",
					why: "Sending via the platform test domain is disabled on this deployment.",
					fix: "Verify your own domain, or enable PLATFORM_TEST_ENABLED.",
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

			const platformDomain = emailConfig.PLATFORM_TEST_FROM_DOMAIN;
			const localPart = emailConfig.PLATFORM_TEST_FROM_LOCAL_PART;

			const [orgRow] = await db
				.select({ name: organization.name })
				.from(organization)
				.where(eq(organization.id, session.organizationId))
				.limit(1);

			const fromName =
				orgRow?.name?.trim() ||
				session.userName?.trim() ||
				"Reloop";

			const from = buildPlatformFromAddress({
				localPart,
				domainName: platformDomain,
				fromName,
			});

			const html = await render(
				React.createElement(OnboardingTestEmail, {
					baseUrl: emailConfig.BASE_URL,
					recipientEmail: to,
					fromAddress: from,
					domainName: platformDomain,
					mode: "platform",
				}),
			);

			const mailPlatformTestUrl = `${emailConfig.BASE_URL}/api/mail/v1/platform-test`;
			const apiKeyHeader = request.headers.get("x-api-key");

			const forwardHeaders: Record<string, string> = {
				"Content-Type": "application/json",
			};
			// Prefer the user's just-generated API key so the real key path is exercised.
			if (apiKeyHeader) {
				forwardHeaders["x-api-key"] = apiKeyHeader;
			} else {
				const cookie = request.headers.get("cookie");
				if (cookie) forwardHeaders.Cookie = cookie;
			}

			try {
				const response = await fetch(mailPlatformTestUrl, {
					method: "POST",
					headers: forwardHeaders,
					body: JSON.stringify({
						html,
						subject: "Your Reloop API key works",
						from_name: fromName,
						recipient_email: to,
						text: `Your Reloop API key works. This message was sent from ${from} to ${to} using Reloop's platform test domain (${platformDomain}). Add and verify your own domain for production From addresses.`,
					}),
				});

				const payload = await response.json().catch(() => ({}));

				if (!response.ok) {
					set.status = response.status;
					return {
						message:
							(payload as { message?: string }).message ||
							(payload as { why?: string }).why ||
							"Failed to send platform test email",
						why: (payload as { why?: string }).why,
						fix: (payload as { fix?: string }).fix,
					};
				}

				return {
					object: "email",
					event: "email.sent",
					mode: "platform",
					to,
					from,
					domain: platformDomain,
					...(payload as Record<string, unknown>),
				};
			} catch (error) {
				set.status = 500;
				return {
					message: "Internal server error during email dispatch",
					why: error instanceof Error ? error.message : String(error),
				};
			}
		},
		{
			authSession: true,
			body: t.Optional(t.Object({})),
			detail: {
				summary: "Platform test email to signed-in user",
				description:
					"Session-authenticated. Sends a real email from the Reloop-owned platform domain to the signed-in user only. Pass the just-generated API key as x-api-key so inject attributes the Onboarding Key. No request body required.",
				tags: ["Onboarding"],
			},
		},
	);
