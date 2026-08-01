import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { deleteThreadXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { deleteThreadController } from "./delete-thread.controllers";

export const deleteThreadRoute = new Elysia().use(authMiddleware).delete(
	"/:id",
	async ({ params: { id }, organizationId }) => {
		return deleteThreadController(id, organizationId);
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
			summary: "Delete Thread",
			description:
				"Permanently delete a thread and all of its conversation logs",
			"x-codeSamples": deleteThreadXCodeSamples,
		},
	},
);
