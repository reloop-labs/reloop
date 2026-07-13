import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { Elysia, t } from "elysia";
import { verifyDomainController } from "./verify.controllers";

export const verifyRoute = new Elysia().use(authMiddleware).post(
	"/verify",
	async ({ body, organizationId, userId }) => {
		const { domain: domainName } = body;
		const domainResult = await verifyDomainController({
			domainName,
			orgId: organizationId,
		});
		return { userId, organizationId, ...domainResult };
	},
	{
		authKey: true,
		response: {
			200: t.Object({
				userId: t.String(),
				organizationId: t.String(),
				isVerified: t.Boolean(),
			}),
			401: ErrorResponseSchema,
			404: ErrorResponseSchema,
		},
		body: t.Object({
			domain: t.String(),
		}),
		detail: {
			summary: "Verify",
			description:
				"Internal verification endpoint mapping POST API keys to their owner and checking domain verification status.",
			hide: true,
		},
	},
);
