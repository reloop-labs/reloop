import { Elysia, t } from "elysia";
import { log } from "evlog";
import { unsubscribeAllController } from "./unsubscribe-all.controllers";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const unsubscribeAllRoute = new Elysia()
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "unsubscribe-all" }))
	.post(
	"/unsubscribe-all/:token",
	async ({ params }) => {
		const traceId = crypto.randomUUID();
		return await unsubscribeAllController({
			token: params.token,
		});
	},
	{
		rateLimit: true,
		params: t.Object({
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
