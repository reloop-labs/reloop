import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { sendMessageController } from "./send-message.controllers";

export const sendMessageRoute = new Elysia().use(authMiddleware).post(
	"/send",
	async ({ body, organizationId, request }) => {
		return sendMessageController(
			organizationId,
			body,
			request.headers.get("x-api-key") ?? "",
			request.headers.get("cookie") ?? undefined,
		);
	},
	{
		auth: true,
		body: t.Object({
			mailboxId: t.String({ description: "Sender Mailbox ID" }),
			to: t.Union([t.String(), t.Array(t.String())], {
				description: "Recipient email address(es)",
			}),
			subject: t.String({ description: "Email subject" }),
			text: t.Optional(t.String({ description: "Plain text body content" })),
			html: t.Optional(t.String({ description: "HTML body content" })),
			cc: t.Optional(
				t.Union([t.String(), t.Array(t.String())], {
					description: "CC recipient address(es)",
				}),
			),
			bcc: t.Optional(
				t.Union([t.String(), t.Array(t.String())], {
					description: "BCC recipient address(es)",
				}),
			),
			attachments: t.Optional(
				t.Array(
					t.Object({
						content: t.Optional(t.Union([t.String(), t.Unknown()])),
						filename: t.Optional(t.String()),
						path: t.Optional(t.String()),
						content_type: t.Optional(t.String()),
						content_id: t.Optional(t.String()),
					}),
					{ description: "Email attachments" },
				),
			),
		}),
		response: {
			200: MailModel.sendEmailResponse,
			400: MailModel.ErrorResponseSchema,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Messages"],
			summary: "Send Email",
			description: "Send a new email message on behalf of a mailbox",
		},
	},
);
