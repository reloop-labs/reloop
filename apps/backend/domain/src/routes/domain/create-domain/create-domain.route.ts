import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { auditLogHook } from "@reloop/domain/utils/audit-log";
import { Elysia } from "elysia";
import { createDomainController } from "./create-domain.controllers";
import { createDomainXCodeSamples } from "./create-domain.x-codeSamples";

export const createDomainRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 10, windowSeconds: 60, namespace: "create" }))
	.post(
		"/create",
		async ({ body, organizationId, userId }) => {
			const {
				domain,
				custom_return_path,
				tracking,
				click_tracking,
				open_tracking,
				sending_email,
				receiving_email,
				tls,
			} = body;
			return await createDomainController({
				organizationId,
				domain,
				custom_return_path,
				tracking,
				click_tracking,
				open_tracking,
				tls,
				sending_email,
				receiving_email,
				userId,
			});
		},
		{
			auth: true,
			rateLimit: true,
			body: DomainModel.createDomainBody,
			response: {
				201: DomainModel.domainResponse,
				400: ErrorResponseSchema,
				403: ErrorResponseSchema,
				409: ErrorResponseSchema,
			},
			detail: {
				tags: ["Domains"],
				summary: "Create Domain",
				description: "Creates a new domain",
				"x-codeSamples": createDomainXCodeSamples,
			},
			afterResponse: auditLogHook({ action: "created", successStatus: 201 }),
		},
	);
