import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { snoozeThreadController } from "./snooze-thread.controllers";

export const snoozeThreadRoute = new Elysia().use(authMiddleware).post(
	"/:id/snooze",
	async ({ params: { id }, body, organizationId }) => {
		return snoozeThreadController(id, organizationId, body.until);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Thread ID" }),
		}),
		body: t.Object({
			until: t.String({
				format: "date-time",
				description: "ISO 8601 wake time for the snoozed thread",
			}),
		}),
		response: {
			200: t.Object({
				success: t.Boolean(),
				id: t.String(),
				snoozedUntil: t.String(),
			}),
			400: MailModel.ErrorResponseSchema,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Threads"],
			summary: "Snooze Thread",
			description: "Hide a thread from the inbox until the given wake time",
		},
	},
);
