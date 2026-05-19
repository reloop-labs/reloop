import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { Elysia, t } from "elysia";
import { updatePreferenceController } from "./update-preference.controllers";

export const updatePreferenceRoute = new Elysia()
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "update-preference",
		}),
	)
	.post(
		"/update/:token",
		async ({ params, body }) => {
			const _traceId = crypto.randomUUID();
			return await updatePreferenceController({
				token: params.token,
				channelId: body.channelId,
				subscribe: body.subscribe,
			});
		},
		{
			rateLimit: true,
			params: t.Object({
				token: t.String({ description: "Signed preference token" }),
			}),
			body: t.Object({
				channelId: t.String({ description: "ID of the channel to update" }),
				subscribe: t.Boolean({
					description: "true to subscribe, false to unsubscribe",
				}),
			}),
			detail: {
				tags: ["Preferences"],
				summary: "Update channel preference",
				description:
					"Toggle a contact's subscription to a public channel. No auth required — token is self-contained.",
			},
		},
	);
