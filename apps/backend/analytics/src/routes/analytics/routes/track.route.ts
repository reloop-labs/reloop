import { trackEventHandler } from "../controllers/track-event";
import { AnalyticsModel } from "../analytics.model";
import { Elysia } from "elysia";

export const trackRoute = new Elysia().post(
	"/track",
	async ({ body }) => {
		return await trackEventHandler(body);
	},
	{
		body: AnalyticsModel.trackEventBody,
		response: {
			200: AnalyticsModel.trackEventResponse,
			400: AnalyticsModel.errorResponse,
			500: AnalyticsModel.errorResponse,
		},
		detail: {
			tags: ["Analytics"],
			summary: "Track an analytics event",
			description:
				"Inserts an analytics event into ClickHouse. User information is optional.",
		},
	},
);

