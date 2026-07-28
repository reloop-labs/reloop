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
import { sendEmail } from "@reloop/email/utils/email";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import React from "react";

const sessionRedis = createSessionCacheRedis(emailConfig.REDIS_URL, 5);

const ONBOARDING_TEST_LOCAL_PART = "onboarding";

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
	 * One-click onboarding email after API key generation.
	 * Session auth. From: onboarding@{ONBOARDING_TEST_DOMAIN} → user inbox.
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

			const onboardingTestDomain =
				emailConfig.ONBOARDING_TEST_DOMAIN.trim();
			if (!onboardingTestDomain) {
				set.status = 503;
				return {
					message: "Onboarding test domain not configured",
					why: "ONBOARDING_TEST_DOMAIN is not set on this deployment.",
					fix: "Set ONBOARDING_TEST_DOMAIN (e.g. reloop.dev) and restart the email service.",
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

			const [orgRow] = await db
				.select({ name: organization.name })
				.from(organization)
				.where(eq(organization.id, session.organizationId))
				.limit(1);

			const fromName =
				orgRow?.name?.trim() || session.userName?.trim() || "Reloop";

			const from = buildFromAddress({
				localPart: ONBOARDING_TEST_LOCAL_PART,
				domainName: onboardingTestDomain,
				fromName,
			});

			const subject = "Your Reloop API key works";
			const text = `Your Reloop API key works. This message was sent from ${from} to ${to} using Reloop's onboarding test domain (${onboardingTestDomain}). Add and verify your own domain for production From addresses.`;

			const html = await render(
				React.createElement(OnboardingTestEmail, {
					baseUrl: emailConfig.BASE_URL,
					recipientEmail: to,
					fromAddress: from,
					domainName: onboardingTestDomain,
					mode: "platform",
				}),
			);

			try {
				const result = await sendEmail({
					from,
					to,
					subject,
					html,
					text,
				});

				return {
					object: "email",
					event: "email.sent",
					mode: "onboarding_test",
					to,
					from,
					domain: onboardingTestDomain,
					...(result && typeof result === "object" ? result : {}),
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
			body: t.Optional(t.Object({})),
			detail: {
				summary: "Onboarding test email to signed-in user",
				description:
					"Session-authenticated. Sends from onboarding@{ONBOARDING_TEST_DOMAIN} to the signed-in user only.",
				tags: ["Onboarding"],
			},
		},
	);
