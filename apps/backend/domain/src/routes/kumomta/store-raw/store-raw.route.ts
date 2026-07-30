import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { Elysia, t } from "elysia";
import { storeRawController } from "./store-raw.controllers";

export const storeRawRoute = new Elysia().use(authMiddleware).post(
	"/store-raw",
	async ({ body, organizationId }) => {
		return await storeRawController({
			emailLogId: body.emailLogId,
			rawMessage: body.rawMessage,
			organizationId,
		});
	},
	{
		authKeyInternal: true,
		response: {
			200: t.Object({
				ok: t.Literal(true),
			}),
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		body: t.Object({
			emailLogId: t.String(),
			rawMessage: t.String(),
		}),
		detail: {
			summary: "Store Raw SMTP Message",
			description:
				"Persist the final on-the-wire MIME for an email log after KumoMTA preparation.",
			hide: true,
		},
	},
);
