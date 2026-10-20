import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { Elysia, t } from "elysia";
import { getDkimKeyController } from "./dkim-key.controllers";

export const dkimKeyRoute = new Elysia().use(authMiddleware).post(
	"/dkim-key",
	async ({ body, organizationId }) => {
		const { domainName, recipients } = body;
		return await getDkimKeyController({
			domainName,
			organizationId,
			recipients,
		});
	},
	{
		authKeyInternal: true,
		response: {
			200: t.Object({
				selector: t.Union([t.String(), t.Null()]),
				privateKey: t.Union([t.String(), t.Null()]),
				smtpProviderId: t.Union([t.String(), t.Null()]),
				egress: t.Object({
					pool: t.Union([t.Literal("dedicated"), t.Literal("shared")]),
					address: t.Union([t.String(), t.Null()]),
					hostname: t.Union([t.String(), t.Null()]),
				}),
			}),
			401: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		body: t.Object({
			domainName: t.String(),
			/** Envelope recipients; picks the sending IP and its warmup budget. */
			recipients: t.Optional(t.Array(t.String(), { maxItems: 1000 })),
		}),
		detail: {
			summary: "Get DKIM Key",
			description:
				"Internal endpoint for KumoMTA to fetch the DKIM private key and selector for a given domain, used to sign outgoing emails. Also resolves the organization's sending IP (dedicated or shared).",
			hide: true,
		},
	},
);
