import {
	createAuthPlugin,
	createSessionCacheRedis,
} from "@reloop/auth/middleware";
import { emailConfig } from "@reloop/email/email.config";
import OnboardingTestEmail from "@reloop/email/emails/onboarding-test";
import { render } from "@reloop/email/render";
import { Elysia, t } from "elysia";
import React from "react";

const sessionRedis = createSessionCacheRedis(emailConfig.REDIS_URL, 5);

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
	.post(
		"/onboarding/send-test-email",
		async ({ body: { to, from }, request, set }) => {
			const apiKey = request.headers.get("x-api-key") ?? "";

			const html = await render(
				React.createElement(OnboardingTestEmail, {
					baseUrl: emailConfig.BASE_URL,
				}),
			);

			const mailSendUrl = `${emailConfig.BASE_URL}/api/mail/v1/send`;

			try {
				const response = await fetch(mailSendUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": apiKey,
					},
					body: JSON.stringify({
						from,
						to,
						subject: "Reloop Integration Test Email",
						html,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					set.status = response.status;
					return {
						message:
							errorData.message ||
							errorData.why ||
							"Failed to send email via mail service",
						why: errorData.why,
					};
				}

				return await response.json();
			} catch (error) {
				set.status = 500;
				return {
					message: "Internal server error during email dispatch",
					why: error instanceof Error ? error.message : String(error),
				};
			}
		},
		{
			authKey: true,
			body: t.Object({
				to: t.String(),
				from: t.String(),
			}),
		},
	);
