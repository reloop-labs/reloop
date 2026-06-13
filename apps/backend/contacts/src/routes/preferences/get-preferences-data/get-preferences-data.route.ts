import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { Elysia, t } from "elysia";
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
		"/data",
		async ({ query }) => {
			return await getPreferencesDataController({
				token: query.token,
			});
		},
		{
			rateLimit: true,
			query: t.Object({
				// H-2 fix: token in query param, NOT path — prevents tokens being
				// stored in server access logs, browser history, and Referer headers.
				token: t.String({ description: "Signed preference token" }),
			}),
			detail: {
				tags: ["Preferences"],
				summary: "Get preference page data",
				description:
					"Returns public channels and contact enrollment status for the preference management page. No auth required — token is self-contained.",
				hide: true,
			},
		},
	);
