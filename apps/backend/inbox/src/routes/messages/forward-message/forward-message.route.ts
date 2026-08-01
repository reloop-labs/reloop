import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { forwardMessageXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { forwardMessageController } from "./forward-message.controllers";

export const forwardMessageRoute = new Elysia().use(authMiddleware).post(
	"/:id/forward",
	async ({ params: { id }, body, organizationId, request }) => {
		return forwardMessageController(
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
			id: t.String({ description: "Message ID to forward" }),
		}),
		body: t.Object({
			to: t.Union([t.String(), t.Array(t.String())], {
				description: "Recipient email address(es)",
			}),
			text: t.Optional(
				t.String({ description: "Plain text body context prefix" }),
			),
			html: t.Optional(t.String({ description: "HTML body context prefix" })),
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
			summary: "Forward Message",
			description:
				"Forward an email message to new recipients, appending original headers",
			"x-codeSamples": forwardMessageXCodeSamples,
		},
	},
);
