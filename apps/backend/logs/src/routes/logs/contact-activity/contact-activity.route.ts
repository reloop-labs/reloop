import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { contactActivityController } from "./contact-activity.controllers";

export const contactActivityRoute = new Elysia().use(authMiddleware).get(
	"/emails/contact-activity",
	async ({ query, organizationId }) => {
		return await contactActivityController({
			query,
			organizationId,
		});
	},
	{
		auth: true,
		query: LogsModel.contactActivityQuery,
		response: {
			200: LogsModel.contactActivityResponse,
			401: LogsModel.unauthorized,
			403: LogsModel.forbidden,
			500: LogsModel.internalServerError,
		},
		detail: {
			tags: ["Logs"],
			summary: "Get Contact Email Activity",
			description:
				"Returns all emails sent to a given recipient address with full event timelines. Used to power the Activity section on contact detail pages.",
		},
	},
);
