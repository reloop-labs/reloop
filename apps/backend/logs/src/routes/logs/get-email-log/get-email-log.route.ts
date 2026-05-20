import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { getEmailLogController } from "./get-email-log.controllers";

export const getEmailLogRoute = new Elysia().use(authMiddleware).get(
	"/emails/:id",
	async ({ params: { id }, activeOrganizationId }) => {
		return await getEmailLogController({
			id,
			organizationId: activeOrganizationId as string,
		});
	},
	{
		auth: true,
		params: LogsModel.getEmailLogParams,
		response: {
			200: LogsModel.emailLogFullEntry,
			401: LogsModel.unauthorized,
			403: LogsModel.forbidden,
			404: LogsModel.emailLogNotFound,
			500: LogsModel.internalServerError,
		},
		detail: {
			tags: ["Logs"],
			summary: "Get Email Log Details",
			description: "Returns detailed information for a specific email log.",
		},
	},
);
