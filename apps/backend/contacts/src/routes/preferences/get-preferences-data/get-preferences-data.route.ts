import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { Elysia, t } from "elysia";
import { log } from "evlog";
import { getPreferencesDataController } from "./get-preferences-data.controllers";

export const getPreferencesDataRoute = new Elysia()
	.use(
		rateLimitPlugin({
			max: 60,
			windowSeconds: 60,
			namespace: "get-preference-data",
		}),
	)
	.get(
		"/data/:token",
		async ({ params }) => {
			const traceId = crypto.randomUUID();
			return await getPreferencesDataController({
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
				summary: "Get preference page data",
				description:
					"Returns public channels and contact enrollment status for the preference management page. No auth required — token is self-contained.",
			},
		},
	);
