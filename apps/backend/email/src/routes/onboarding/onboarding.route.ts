import {
	createAuthPlugin,
	createSessionCacheRedis,
	resolveSessionAuthWithProfile,
} from "@reloop/auth/middleware";
import { db } from "@reloop/db/client";
import { domain, organization } from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import OnboardingTestEmail from "@reloop/email/emails/onboarding-test";
import { render } from "@reloop/email/render";
import { and, desc, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import React from "react";

const sessionRedis = createSessionCacheRedis(emailConfig.REDIS_URL, 5);

/** Default local-part for one-click first sends. */
const DEFAULT_LOCAL_PART = "hello";

function buildFromAddress({
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
	 * One-click first/test email.
	 * Session auth only. No body required.
	 * - To: signed-in user email
	 * - From: hello@<first active org domain> (display name = workspace name)
	 * - Body: onboarding-test React email template
	 */
	.post(
		"/onboarding/send-test-email",
		async ({ request, set }) => {
			const cookie = request.headers.get("cookie");
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

			const to = session.userEmail?.trim();
			if (!to) {
				set.status = 400;
				return {
					message: "No email on your account",
					why: "Your signed-in user has no email address to deliver to.",
					fix: "Update your profile email, then try again.",
				};
			}

			const [domainRow] = await db
				.select({
					id: domain.id,
					domain: domain.domain,
					status: domain.status,
					isSendingEmailEnabled: domain.isSendingEmailEnabled,
				})
				.from(domain)
				.where(
					and(
						eq(domain.organizationId, session.organizationId),
						eq(domain.status, "active"),
					),
				)
				.orderBy(desc(domain.createdAt))
				.limit(1);

			if (!domainRow) {
				set.status = 400;
				return {
					message: "No active domain",
					why: "You need a verified domain before sending a test email.",
					fix: "Add a domain and finish DNS verification, then try again.",
				};
			}

			if (domainRow.isSendingEmailEnabled === false) {
				set.status = 400;
				return {
					message: "Sending is disabled for this domain",
					why: `"${domainRow.domain}" has outbound sending turned off.`,
					fix: "Enable sending for this domain, then try again.",
				};
			}

			const [orgRow] = await db
				.select({ name: organization.name })
				.from(organization)
				.where(eq(organization.id, session.organizationId))
				.limit(1);

			const fromName =
				orgRow?.name?.trim() ||
				session.userName?.trim() ||
				undefined;

			const from = buildFromAddress({
				localPart: DEFAULT_LOCAL_PART,
				domainName: domainRow.domain,
				fromName,
			});

			const html = await render(
				React.createElement(OnboardingTestEmail, {
					baseUrl: emailConfig.BASE_URL,
					recipientEmail: to,
					fromAddress: from,
					domainName: domainRow.domain,
				}),
			);

			const mailSendUrl = `${emailConfig.BASE_URL}/api/mail/v1/send`;

			try {
				const response = await fetch(mailSendUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...(cookie ? { Cookie: cookie } : {}),
					},
					body: JSON.stringify({
						from,
						to,
						subject: `${domainRow.domain} is ready to send emails`,
						html,
					}),
				});

				const payload = await response.json().catch(() => ({}));

				if (!response.ok) {
					set.status = response.status;
					return {
						message:
							(payload as { message?: string }).message ||
							(payload as { why?: string }).why ||
							"Failed to send email via mail service",
						why: (payload as { why?: string }).why,
						fix: (payload as { fix?: string }).fix,
					};
				}

				return {
					object: "email",
					event: "email.sent",
					to,
					from,
					domainId: domainRow.id,
					domain: domainRow.domain,
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
			detail: {
				summary: "One-click first email to signed-in user",
				description:
					"Session-authenticated. Picks the first active org domain, sends the onboarding-test template to the signed-in user. No request body.",
				tags: ["Onboarding"],
			},
		},
	);
