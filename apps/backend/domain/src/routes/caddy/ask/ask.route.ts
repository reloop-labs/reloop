import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { Elysia, t } from "elysia";
import { isActiveTrackingHostname } from "./ask.controllers";

/**
 * Caddy on-demand TLS `ask` endpoint.
 *
 * Caddy GETs `?domain=<hostname>` before obtaining a certificate. A 2xx
 * response allows issuance; any other status denies it.
 *
 * @see https://caddyserver.com/docs/caddyfile/options#on-demand-tls
 */
export const caddyAskRoute = new Elysia().get(
	"/caddy/ask",
	async ({ query, set }) => {
		const hostname = query.domain?.trim() ?? "";
		if (!hostname) {
			set.status = 400;
			return {
				message: "Missing domain query parameter",
				why: "Caddy on-demand TLS asks require ?domain=<hostname>.",
				fix: "Call GET /api/domain/v1/caddy/ask?domain=link.example.com",
			};
		}

		const active = await isActiveTrackingHostname(hostname);
		if (!active) {
			// Non-2xx denies certificate issuance (Caddy on_demand_tls.ask contract).
			set.status = 404;
			return { active: false };
		}

		return { active: true };
	},
	{
		query: t.Object({
			domain: t.Optional(
				t.String({
					description:
						"Hostname Caddy wants a certificate for (customer tracking CNAME host)",
				}),
			),
		}),
		response: {
			200: t.Object({
				active: t.Literal(true),
			}),
			400: ErrorResponseSchema,
			404: t.Object({
				active: t.Literal(false),
			}),
		},
		detail: {
			summary: "Caddy on-demand TLS ask",
			description:
				"Internal endpoint for Caddy: returns 200 when the hostname is an active custom tracking domain (verified CNAME), otherwise 404. Used to gate automatic TLS certificate issuance.",
			hide: true,
		},
	},
);
