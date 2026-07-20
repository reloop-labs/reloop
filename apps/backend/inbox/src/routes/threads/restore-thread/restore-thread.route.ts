import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { restoreThreadController } from "./restore-thread.controllers";
import { restoreThreadXCodeSamples } from "./restore-thread.x-codeSamples";

export const restoreThreadRoute = new Elysia().use(authMiddleware).post(
	"/:id/restore",
	async ({ params: { id }, organizationId }) => {
		return restoreThreadController(id, organizationId);
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
			summary: "Restore Thread",
			description:
				"Restore a thread from trash, archive, or spam back to the inbox",
			"x-codeSamples": restoreThreadXCodeSamples,
		},
	},
);
