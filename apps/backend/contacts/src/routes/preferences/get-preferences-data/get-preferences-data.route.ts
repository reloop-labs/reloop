
import { Elysia, t } from "elysia";
import { getPreferencesDataController } from "./get-preferences-data.controllers";

export const getPreferencesDataRoute = new Elysia().get(
	"/data/:token",
	async ({ params }) => {
		const traceId = crypto.randomUUID();
		const routeLogger = log;
		return await getPreferencesDataController({
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
			summary: "Get preference page data",
			description:
				"Returns public channels and contact enrollment status for the preference management page. No auth required — token is self-contained.",
		},
	},
);
