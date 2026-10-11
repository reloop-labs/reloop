import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { Elysia, t } from "elysia";
import {
	assertInternalSecret,
	getSmtpRelayController,
} from "./smtp-relay.controllers";

export const smtpRelayRoute = new Elysia().post(
	"/smtp-relay",
	async ({ body, headers }) => {
		assertInternalSecret(headers["x-internal-secret"]);
		return getSmtpRelayController(body.providerId);
	},
	{
		body: t.Object({ providerId: t.String() }),
		response: {
			200: t.Object({
				host: t.String(),
				addr: t.String(),
				port: t.Number(),
				security: t.Union([t.Literal("starttls"), t.Literal("none")]),
				username: t.Union([t.String(), t.Null()]),
				password: t.Union([t.String(), t.Null()]),
			}),
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			summary: "Get SMTP relay config",
			description:
				"Internal endpoint for KumoMTA to fetch a bring-your-own SMTP relay (host, vetted IP, credentials).",
			hide: true,
		},
	},
);
