import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { Elysia, t } from "elysia";
import { checkRecipientController } from "./check-recipient.controllers";

export const checkRecipientRoute = new Elysia().post(
	"/check-recipient",
	async ({ body }) => {
		const { email } = body;
		return await checkRecipientController(email);
	},
	{
		body: t.Object({
			email: t.String(),
		}),
		response: {
			200: t.Object({
				allowed: t.Boolean(),
			}),
			500: ErrorResponseSchema,
		},
		detail: {
			summary: "Check Inbound Recipient Mailbox",
			description:
				"Check if the recipient email has an active mailbox in the database.",
			hide: true,
		},
	},
);
