import {
	createAuthPlugin,
	createSessionCacheRedis,
	resolveSessionAuthWithProfile,
} from "@reloop/auth/middleware";
import { db } from "@reloop/db/client";
import { domain } from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import OnboardingTestEmail from "@reloop/email/emails/onboarding-test";
import { render } from "@reloop/email/render";
import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import React from "react";

const sessionRedis = createSessionCacheRedis(emailConfig.REDIS_URL, 5);

const LOCAL_PART_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const MAX_LOCAL_PART_LENGTH = 64;

function buildFromAddress({
	localPart,
	domainName,
	fromName,
}: {
	localPart: string;
	domainName: string;
	fromName?: string;
}): string {
	const address = `${localPart}@${domainName}`;
	const name = fromName?.trim();
	if (!name) return address;
	// Escape quotes in display names for RFC 5322.
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
	 * Send a first/test email to the signed-in user from one of their org domains.
	 * Session auth only — recipient is always the authenticated user (no arbitrary to:).
	 */
	.post(
		"/onboarding/send-test-email",
		async ({ body, request, set }) => {
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

			const localPart = (body.localPart ?? "hello").trim().toLowerCase();
			if (
				!localPart ||
				localPart.length > MAX_LOCAL_PART_LENGTH ||
				!LOCAL_PART_PATTERN.test(localPart)
			) {
				set.status = 400;
				return {
					message: "Invalid sender local part",
					why: `"${body.localPart ?? ""}" is not a valid email local-part.`,
					fix: "Use letters, numbers, and common symbols only (e.g. hello, noreply).",
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
						eq(domain.id, body.domainId),
						eq(domain.organizationId, session.organizationId),
					),
				)
				.limit(1);

			if (!domainRow) {
				set.status = 404;
				return {
					message: "Domain not found",
					why: "That domain is not in your active workspace.",
					fix: "Pick a domain you own, or add one under Domains.",
				};
			}

			if (domainRow.status !== "active") {
				set.status = 400;
				return {
					message: "Domain is not ready to send",
					why: `"${domainRow.domain}" is ${domainRow.status}, not active.`,
					fix: "Finish DNS verification so the domain status is Active.",
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

			const from = buildFromAddress({
				localPart,
				domainName: domainRow.domain,
				fromName: body.fromName,
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
						// Forward the browser session so mail uses session auth
						// (no API key required; internal inject for Kumo).
						...(cookie ? { Cookie: cookie } : {}),
					},
					body: JSON.stringify({
						from,
						to,
						subject: "Your Reloop domain is ready to send",
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
			body: t.Object({
				domainId: t.String({
					minLength: 1,
					description: "Active org domain id to send from",
				}),
				localPart: t.Optional(
					t.String({
						minLength: 1,
						maxLength: MAX_LOCAL_PART_LENGTH,
						description: "Local part of the From address (default: hello)",
						examples: ["hello", "noreply", "team"],
					}),
				),
				fromName: t.Optional(
					t.String({
						maxLength: 80,
						description: "Optional display name for the From header",
						examples: ["Acme", "Reloop"],
					}),
				),
			}),
			detail: {
				summary: "Send first/test email to signed-in user",
				description:
					"Session-authenticated. Sends a test message from an active org domain to the signed-in user's email. Recipient cannot be overridden.",
				tags: ["Onboarding"],
			},
		},
	);
