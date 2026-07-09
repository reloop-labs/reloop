import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { unsnoozeThreadController } from "./unsnooze-thread.controllers";

export const unsnoozeThreadRoute = new Elysia().use(authMiddleware).post(
	"/:id/unsnooze",
	async ({ params: { id }, organizationId }) => {
		return unsnoozeThreadController(id, organizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Thread ID" }),
		}),
		response: {
			200: MailModel.successResponse,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Threads"],
			summary: "Unsnooze Thread",
			description: "Return a snoozed thread to the inbox immediately",
		},
	},
);
