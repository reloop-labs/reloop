import { logger } from "@reloop/logger";
import { Elysia, t } from "elysia";
import { unsubscribeAllController } from "./unsubscribe-all.controllers";

export const unsubscribeAllRoute = new Elysia().post(
	"/unsubscribe-all/:token",
	async ({ params }) => {
		const traceId = crypto.randomUUID();
		const routeLogger = logger.child({ traceId, route: "unsubscribe-all" });
		return await unsubscribeAllController({
			token: params.token,
			logger: routeLogger,
		});
	},
	{
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
