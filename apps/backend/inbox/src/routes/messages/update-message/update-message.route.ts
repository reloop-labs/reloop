import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { updateMessageXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { updateMessageController } from "./update-message.controllers";

export const updateMessageRoute = new Elysia().use(authMiddleware).patch(
	"/:id",
	async ({ params: { id }, body, organizationId }) => {
		return updateMessageController(id, organizationId, body);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Message ID" }),
		}),
		body: t.Object({
			isRead: t.Optional(
				t.Boolean({ description: "Read status of the message" }),
			),
			isStarred: t.Optional(
				t.Boolean({ description: "Starred status of the message" }),
			),
			isSpam: t.Optional(
				t.Boolean({ description: "Spam status of the message" }),
			),
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
			summary: "Update Message Status",
			description:
				"Update status attributes (isRead, isStarred, isSpam) of a message",
			"x-codeSamples": updateMessageXCodeSamples,
		},
	},
);
