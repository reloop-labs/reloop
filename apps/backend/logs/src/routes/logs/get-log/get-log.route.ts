import { getLogXCodeSamples } from "@reloop/code-samples/logs";
import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { getLogController } from "./get-log.controllers";

export const getLogRoute = new Elysia().use(authMiddleware).get(
	"/:log_id",
	async ({ params, organizationId }) => {
		return await getLogController(params.log_id, organizationId);
	},
	{
		auth: true,
		params: LogsModel.getLogParams,
		response: {
			200: LogsModel.logDetailResponse,
			401: LogsModel.unauthorized,
			403: LogsModel.forbidden,
			404: LogsModel.logNotFound,
			500: LogsModel.internalServerError,
		},
		detail: {
			tags: ["Logs"],
			summary: "Get Log",
			description: "Returns a single log entry by id.",
			"x-codeSamples": getLogXCodeSamples,
		},
	},
);
