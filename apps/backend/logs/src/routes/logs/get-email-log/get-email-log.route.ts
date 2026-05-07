import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { getEmailLogController } from "./get-email-log.controllers";

export const getEmailLogRoute = new Elysia().use(authMiddleware).get(
	"/emails/:id",
	async ({ params: { id }, activeOrganizationId, set }) => {
		const log = await getEmailLogController({
			id,
			organizationId: activeOrganizationId as string,
		});

		if (!log) {
			set.status = 404;
			return { message: "Email log not found" };
		}

		return log;
	},
	{
		auth: true,
		params: LogsModel.getEmailLogParams,
		response: {
			200: LogsModel.emailLogFullEntry,
			401: LogsModel.errorResponse,
			403: LogsModel.errorResponse,
			404: LogsModel.errorResponse,
			500: LogsModel.errorResponse,
		},
		detail: {
			tags: ["Logs"],
			summary: "Get Email Log Details",
			description: "Returns detailed information for a specific email log.",
		},
	},
);
