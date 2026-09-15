import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { Elysia, t } from "elysia";
import { unsubscribeController } from "./unsubscribe.controllers";

export const unsubscribeRoute = new Elysia()
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "unsubscribe",
		}),
	)
	.post(
		"/unsubscribe",
		async ({ body }) => {
			return await unsubscribeController({
				token: body.token,
			});
		},
		{
			rateLimit: true,
			body: t.Object({
				token: t.String({ description: "Signed preference token" }),
			}),
			detail: {
				tags: ["Preferences"],
				summary: "Unsubscribe from the main list",
				description:
					"Set the contact's top-level status to unsubscribed. Channel enrollments are unchanged. No auth required — token is self-contained.",
				hide: true,
			},
		},
	);
