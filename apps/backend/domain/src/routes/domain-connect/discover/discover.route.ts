import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { discoverController } from "@reloop/domain/routes/domain-connect/discover/discover.controllers";
import { Elysia, t } from "elysia";

export const discoverRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 10, windowSeconds: 60, namespace: "dc-discover" }),
	)
	.get(
		"/discover/:domain_id",
		async ({ params: { domain_id }, organizationId }) => {
			return await discoverController({
				domainId: domain_id,
				organizationId,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				domain_id: t.String(),
			}),
			response: {
				200: t.Object({
					supported: t.Boolean(),
					templateSupported: t.Boolean(),
					provider: t.Union([
						t.Object({
							id: t.String(),
							name: t.String(),
							displayName: t.String(),
						}),
						t.Null(),
					]),
					error: t.Optional(t.String()),
				}),
				404: ErrorResponseSchema,
				403: ErrorResponseSchema,
				500: ErrorResponseSchema,
			},
			detail: {
				tags: ["Domain Connect"],
				summary: "Discover Domain Connect Support",
				description:
					"Checks if the domain's DNS provider supports Domain Connect and has onboarded the Reloop template",
			},
		},
	);
