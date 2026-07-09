import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { replyAllToMessageController } from "./reply-all-to-message.controllers";

export const replyAllToMessageRoute = new Elysia().use(authMiddleware).post(
	"/:id/reply-all",
	async ({ params: { id }, body, organizationId, request }) => {
		return replyAllToMessageController(
			id,
			organizationId,
			body,
			request.headers.get("x-api-key") ?? "",
			request.headers.get("cookie") ?? undefined,
		);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Message ID to reply all to" }),
		}),
		body: t.Object({
			text: t.Optional(t.String({ description: "Plain text body content" })),
			html: t.Optional(t.String({ description: "HTML body content" })),
			bcc: t.Optional(
				t.Union([t.String(), t.Array(t.String())], {
					description: "BCC recipient address(es)",
				}),
			),
			attachments: t.Optional(
				t.Array(
					t.Object({
						content: t.Optional(t.String()),
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
			summary: "Reply All to Message",
			description:
				"Reply all to an email message, copying all original recipients",
		},
	},
);
