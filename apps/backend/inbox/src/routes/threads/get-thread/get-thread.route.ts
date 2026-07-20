import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { getThreadController } from "./get-thread.controllers";
import { getThreadXCodeSamples } from "./get-thread.x-codeSamples";

export const getThreadRoute = new Elysia().use(authMiddleware).get(
	"/:id",
	async ({ params: { id }, organizationId }) => {
		return getThreadController(id, organizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Thread ID" }),
		}),
		response: {
			200: MailModel.threadDetailResponse,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Threads"],
			summary: "Get Thread",
			description:
				"Retrieve a specific thread by ID, including its conversation messages and attachments",
			"x-codeSamples": getThreadXCodeSamples,
		},
	},
);
