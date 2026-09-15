import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { Elysia, t } from "elysia";
import { oneClickUnsubscribeController } from "./one-click.controllers";

export const oneClickUnsubscribeRoute = new Elysia()
	.use(
		rateLimitPlugin({
			max: 60,
			windowSeconds: 60,
			namespace: "one-click-unsubscribe",
		}),
	)
	.post(
		"/one-click/:token",
		async ({ params }) => {
			return await oneClickUnsubscribeController({
				token: params.token,
			});
		},
		{
			rateLimit: true,
			params: t.Object({
				// RFC 8058: providers POST to the List-Unsubscribe URL itself, so the
				// token must live in the path (unlike the interactive endpoints that
				// keep it in the POST body per H-2).
				token: t.String({ description: "Signed preference token" }),
			}),
			detail: {
				tags: ["Preferences"],
				summary: "One-click unsubscribe (RFC 8058)",
				description:
					"Unsubscribe a contact from the main list and all channels via the List-Unsubscribe POST. No auth required — token is self-contained.",
				hide: true,
			},
		},
	);
