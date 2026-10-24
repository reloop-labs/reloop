import { apiKeyAllowsAddress } from "@reloop/db/api-key-scope";
import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { Elysia, t } from "elysia";

/**
 * Lightweight AUTH PLAIN check for KumoMTA (SMTP) and the IMAP service. The
 * API key is validated by authKey middleware; a 200 means the password is a
 * live Reloop key. When `email` is given, the key's address scope must also
 * allow it — a refusal is a 401 so callers treat it as bad credentials rather
 * than a temporary failure.
 */
export const smtpAuthRoute = new Elysia().use(authMiddleware).post(
	"/smtp-auth",
	async ({ organizationId, apiKeyId, body, status }) => {
		const email = body?.email?.trim();
		if (email && !(apiKeyId && (await apiKeyAllowsAddress(apiKeyId, email)))) {
			return status(401, {
				message: "API key is not allowed to use this address",
				why: `The key's address restrictions do not include ${email}`,
				fix: "Use a key with access to this domain or address",
			});
		}
		return { ok: true as const, organizationId };
	},
	{
		authKey: true,
		body: t.Optional(
			t.Object({
				email: t.Optional(t.String({ maxLength: 320 })),
			}),
		),
		response: {
			200: t.Object({
				ok: t.Literal(true),
				organizationId: t.String(),
			}),
			401: ErrorResponseSchema,
		},
		detail: {
			summary: "SMTP / IMAP AUTH",
			description:
				"Validate an SMTP AUTH PLAIN or IMAP LOGIN password as a Reloop API key, optionally checking the key may use `email`. Used by KumoMTA and the IMAP service.",
			hide: true,
		},
	},
);
