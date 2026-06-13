import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { Elysia, t } from "elysia";
import { logIncomingController } from "./log-incoming.controllers";

export const logIncomingRoute = new Elysia().use(authMiddleware).post(
	"/log-incoming",
	async ({ body, organizationId }) => {
		return await logIncomingController({
			body,
			organizationId,
		});
	},
	{
		apiKeyAuth: true,
		response: {
			200: t.Object({
				id: t.String(),
				trackingDomain: t.Nullable(t.String()),
				clickTracking: t.Boolean(),
				openTracking: t.Boolean(),
			}),
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			404: ErrorResponseSchema,
			409: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		body: t.Object({
			domainName: t.String(),
			messageId: t.String(),
			providerMessageId: t.Optional(t.String()),
			fromEmail: t.String(),
			toEmails: t.Array(t.String()),
			subject: t.String(),
			textBody: t.Optional(t.String()),
			htmlBody: t.Optional(t.String()),
			rawMessage: t.Optional(t.String()),
			size: t.Number(),
		}),
		detail: {
			summary: "Log Incoming Email",
			description:
				"Log incoming SMTP email into the DB, returning the new email log ID.",
			hide: true,
		},
	},
);
