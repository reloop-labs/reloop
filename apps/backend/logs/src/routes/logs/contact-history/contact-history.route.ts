import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { contactHistoryController } from "./contact-history.controllers";

export const contactHistoryRoute = new Elysia().use(authMiddleware).get(
	"/contacts/:contact_id/history",
	async ({ params, query, organizationId }) => {
		return await contactHistoryController({
			contactId: params.contact_id,
			organizationId,
			query,
		});
	},
	{
		auth: true,
		params: LogsModel.contactHistoryParams,
		query: LogsModel.contactHistoryQuery,
		response: {
			200: LogsModel.contactHistoryResponse,
			401: LogsModel.unauthorized,
			403: LogsModel.forbidden,
			500: LogsModel.internalServerError,
		},
		detail: {
			tags: ["Logs"],
			summary: "Get Contact Action History",
			description:
				"Returns profile and membership actions for a contact (updates, groups, channels). Powers the Activity timeline on contact detail pages alongside email activity.",
		},
	},
);
