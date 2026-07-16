import { Elysia, t } from "elysia";
import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { applyUrlController } from "@reloop/domain/routes/domain-connect/apply-url/apply-url.controllers";

export const applyUrlRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 10, windowSeconds: 60, namespace: "dc-apply" }))
	.get(
		"/apply-url/:domain_id",
		async ({ params: { domain_id }, query, organizationId }) => {
			return await applyUrlController({
				domainId: domain_id,
				organizationId,
				groupIds: query.groupIds,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				domain_id: t.String(),
			}),
			query: t.Object({
				groupIds: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					applyUrl: t.String(),
					provider: t.Object({
						id: t.String(),
						name: t.String(),
						displayName: t.String(),
					}),
				}),
				400: ErrorResponseSchema,
				404: ErrorResponseSchema,
				403: ErrorResponseSchema,
				500: ErrorResponseSchema,
			},
			detail: {
				tags: ["Domain Connect"],
				summary: "Get Domain Connect Apply URL",
				description:
					"Builds a signed Domain Connect apply URL that redirects the user to their DNS provider's consent page",
			},
		},
	);
