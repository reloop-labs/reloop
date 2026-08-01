import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { batchGetMessagesXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { batchGetMessagesController } from "./batch-get-messages.controllers";

export const batchGetMessagesRoute = new Elysia().use(authMiddleware).post(
	"/batch",
	async ({ body, organizationId }) => {
		return batchGetMessagesController(organizationId, body.ids);
	},
	{
		auth: true,
		body: t.Object({
			ids: t.Array(t.String({ description: "Message ID" }), { maxItems: 100 }),
		}),
		response: {
			200: MailModel.messageListResponse,
			400: MailModel.ErrorResponseSchema,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Messages"],
			summary: "Batch Get Messages",
			description: "Retrieve multiple email messages by their IDs (max 100)",
			"x-codeSamples": batchGetMessagesXCodeSamples,
		},
	},
);
