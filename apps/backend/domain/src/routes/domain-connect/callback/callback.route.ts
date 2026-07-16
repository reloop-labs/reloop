import { Elysia, t } from "elysia";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { callbackController } from "@reloop/domain/routes/domain-connect/callback/callback.controllers";

export const callbackRoute = new Elysia()
	.use(
		rateLimitPlugin({ max: 20, windowSeconds: 60, namespace: "dc-callback" }),
	)
	.get(
		"/callback",
		async ({ query, redirect }) => {
			const result = await callbackController({
				state: query.state,
				error: query.error,
				errorDescription: query.error_description,
			});

			// Redirect browser back to the frontend domain detail page or onboarding page
			return redirect(result.redirectUrl);
		},
		{
			rateLimit: true,
			query: t.Object({
				state: t.Optional(t.String()),
				error: t.Optional(t.String()),
				error_description: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Domain Connect"],
				summary: "Domain Connect Callback",
				description:
					"Handles the redirect from the DNS provider after the user approves or denies DNS record changes",
			},
		},
	);
