import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { Elysia, t } from "elysia";
import { getDkimKeyController } from "./dkim-key.controllers";

export const dkimKeyRoute = new Elysia().use(authMiddleware).post(
	"/dkim-key",
	async ({ body, organizationId }) => {
		const { domainName } = body;
		return await getDkimKeyController({
			domainName,
			organizationId,
		});
	},
	{
		apiKeyAuth: true,
		response: {
			200: t.Object({
				selector: t.String(),
				privateKey: t.String(),
			}),
			401: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		body: t.Object({
			domainName: t.String(),
		}),
		detail: {
			summary: "Get DKIM Key",
			description:
				"Internal endpoint for KumoMTA to fetch the DKIM private key and selector for a given domain, used to sign outgoing emails.",
			hide: true,
		},
	},
);
