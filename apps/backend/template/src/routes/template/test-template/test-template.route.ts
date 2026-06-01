import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, t } from "elysia";
import { sendTestEmail } from "./test-template.controllers";

export const testTemplateRoute = new Elysia()
	.use(authMiddleware)
	.post(
		"/:id/test",
		async ({ params, body, organizationId }) => {
			const { id } = params;

			const result = await sendTestEmail({
				templateId: id,
				organizationId,
				to: body.to,
				fromEmail: body.fromEmail,
				subject: body.subject,
				html: body.html,
				variables: body.variables || {},
			});

			return result;
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				to: t.String({ minLength: 1 }),
				fromEmail: t.Optional(t.String()),
				subject: t.Optional(t.String()),
				html: t.Optional(t.String()),
				variables: t.Optional(t.Record(t.String(), t.Any())),
			}),
			response: {
				200: t.Object({
					success: t.Boolean(),
				}),
				400: ErrorResponseSchema,
				401: ErrorResponseSchema,
				403: ErrorResponseSchema,
				404: ErrorResponseSchema,
				500: ErrorResponseSchema,
			},
			detail: {
				tags: ["Templates"],
				summary: "Send test email",
				description: "Sends a test email for the template with resolved variables.",
			},
		},
	);
