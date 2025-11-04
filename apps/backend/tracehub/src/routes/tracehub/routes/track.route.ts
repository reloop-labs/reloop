import { Elysia } from "elysia";
import { trackEventHandler } from "../controllers/track-event";
import { TraceHubModel } from "../tracehub.model";

export const trackRoute = new Elysia().post(
	"/track",
	async ({ body }) => {
		return await trackEventHandler(body);
	},
	{
		body: TraceHubModel.trackEventBody,
		response: {
			200: TraceHubModel.trackEventResponse,
			400: TraceHubModel.errorResponse,
			500: TraceHubModel.errorResponse,
		},
		detail: {
			tags: ["tracehub"],
			summary: "Track a tracehub event",
			description:
				"Inserts a tracehub event into ClickHouse. User information is optional.",
		},
	},
);
