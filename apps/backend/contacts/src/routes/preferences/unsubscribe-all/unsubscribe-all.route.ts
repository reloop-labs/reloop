import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { Elysia, t } from "elysia";
import { unsubscribeAllController } from "./unsubscribe-all.controllers";

export const unsubscribeAllRoute = new Elysia()
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "unsubscribe-all",
		}),
	)
	.post(
		"/unsubscribe-all",
		async ({ body }) => {
			return await unsubscribeAllController({
				token: body.token,
			});
		},
		{
			rateLimit: true,
			body: t.Object({
				// H-2 fix: token in POST body, not URL path.
				token: t.String({ description: "Signed preference token" }),
			}),
			detail: {
				tags: ["Preferences"],
				summary: "Unsubscribe from all channels",
				description:
					"Unenroll a contact from all their channel subscriptions. No auth required — token is self-contained.",
			},
		},
	);
