import { validateApiKey } from "@reloop/apikey";
import { emailConfig } from "@reloop/email/email.config";
import OnboardingTestEmail from "@reloop/email/emails/onboarding-test";
import { redis } from "@reloop/email/lib/redis";
import { render } from "@reloop/email/render";
import { Elysia, t } from "elysia";
import React from "react";

export const onboardingRoute = new Elysia({
	prefix: "/v1",
	name: "OnboardingRoute",
}).post(
	"/onboarding/send-test-email",
	async ({ body: { to, from }, request, set }) => {
		const apiKey = request.headers.get("x-api-key");
		if (!apiKey) {
			set.status = 401;
			return { message: "Authentication required" };
		}

		// Validate the API key using database/redis
		const apiKeyResult = await validateApiKey(apiKey, redis);
		if (!apiKeyResult) {
			set.status = 401;
			return { message: "Invalid API key" };
		}

		// Render the React-Email template
		const html = await render(
			React.createElement(OnboardingTestEmail, {
				baseUrl: emailConfig.BASE_URL,
			}),
		);

		// Call the mail service to send the email via KumoMTA
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
				// In development/test environments, rejectUnauthorized: false is set via env if needed,
				// but since Bun fetch doesn't support agents easily, Node TLS settings from index.ts will apply.
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
		body: t.Object({
			to: t.String(),
			from: t.String(),
		}),
	},
);
