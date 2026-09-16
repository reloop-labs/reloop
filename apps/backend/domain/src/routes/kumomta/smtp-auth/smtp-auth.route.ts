import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { Elysia, t } from "elysia";

/**
 * Lightweight AUTH PLAIN check for KumoMTA. The API key is validated by
 * authKey middleware; a 200 means the SMTP password is a live Reloop key.
 */
export const smtpAuthRoute = new Elysia().use(authMiddleware).post(
	"/smtp-auth",
	({ organizationId }) => ({
		ok: true as const,
		organizationId,
	}),
	{
		authKey: true,
		body: t.Optional(t.Object({})),
		response: {
			200: t.Object({
				ok: t.Literal(true),
				organizationId: t.String(),
			}),
			401: ErrorResponseSchema,
		},
		detail: {
			summary: "SMTP AUTH",
			description:
				"Validate an SMTP AUTH PLAIN password as a Reloop API key. Used by KumoMTA at connect time.",
			hide: true,
		},
	},
);
