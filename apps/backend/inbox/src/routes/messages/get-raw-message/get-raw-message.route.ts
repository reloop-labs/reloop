import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { getRawMessageController } from "./get-raw-message.controllers";
import { getRawMessageXCodeSamples } from "./get-raw-message.x-codeSamples";

export const getRawMessageRoute = new Elysia().use(authMiddleware).get(
	"/:id/raw",
	async ({ params: { id }, organizationId }) => {
		return getRawMessageController(id, organizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Message ID" }),
		}),
		response: {
			200: MailModel.messageRawResponse,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Messages"],
			summary: "Get Raw Message",
			description:
				"Retrieve the raw, RFC822 formatted string content of a message",
			"x-codeSamples": getRawMessageXCodeSamples,
		},
	},
);
