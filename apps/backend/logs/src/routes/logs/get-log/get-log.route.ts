import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { getLogController } from "./get-log.controllers";
import { getLogXCodeSamples } from "./get-log.x-codeSamples";

export const getLogRoute = new Elysia().use(authMiddleware).get(
	"/:logId",
	async ({ params }) => {
		return await getLogController(params);
	},
	{
		auth: true,
		params: LogsModel.getLogParams,
		response: {
			200: LogsModel.logEntryResponse,
			401: LogsModel.errorResponse,
			403: LogsModel.errorResponse,
			404: LogsModel.errorResponse,
			500: LogsModel.errorResponse,
		},
		detail: {
			tags: ["Logs"],
			summary: "Get Log",
			description: "Returns a single log entry by id.",
			"x-codeSamples": getLogXCodeSamples,
		},
	},
);
