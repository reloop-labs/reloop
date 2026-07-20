import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { toggleThreadStarController } from "./toggle-thread-star.controllers";
import { toggleThreadStarXCodeSamples } from "./toggle-thread-star.x-codeSamples";

export const toggleThreadStarRoute = new Elysia().use(authMiddleware).patch(
	"/:id/star",
	async ({ params: { id }, body, organizationId }) => {
		return toggleThreadStarController(id, organizationId, body.isStarred);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Thread ID" }),
		}),
		body: t.Object({
			isStarred: t.Boolean({ description: "Whether to star the thread" }),
		}),
		response: {
			200: MailModel.successResponse,
			400: MailModel.ErrorResponseSchema,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Threads"],
			summary: "Toggle Thread Star",
			description: "Direct endpoint to toggle starred status of a thread",
			"x-codeSamples": toggleThreadStarXCodeSamples,
		},
	},
);
