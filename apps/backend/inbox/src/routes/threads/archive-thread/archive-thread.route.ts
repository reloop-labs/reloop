import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { archiveThreadXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { archiveThreadController } from "./archive-thread.controllers";

export const archiveThreadRoute = new Elysia().use(authMiddleware).post(
	"/:id/archive",
	async ({ params: { id }, organizationId }) => {
		return archiveThreadController(id, organizationId);
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
			summary: "Archive Thread",
			description: "Archive a thread to hide it from active list",
			"x-codeSamples": archiveThreadXCodeSamples,
		},
	},
);
