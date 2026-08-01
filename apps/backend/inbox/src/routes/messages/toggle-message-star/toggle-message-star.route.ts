import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { toggleMessageStarXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { toggleStarController } from "./toggle-message-star.controllers";

export const toggleMessageStarRoute = new Elysia().use(authMiddleware).patch(
	"/:id/star",
	async ({ params: { id }, body, organizationId }) => {
		return toggleStarController(id, organizationId, body.isStarred);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Message ID" }),
		}),
		body: t.Object({
			isStarred: t.Boolean({ description: "Whether to star the message" }),
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
			tags: ["Messages"],
			summary: "Toggle Message Star",
			description: "Direct endpoint to toggle starred status of a message",
			"x-codeSamples": toggleMessageStarXCodeSamples,
		},
	},
);
