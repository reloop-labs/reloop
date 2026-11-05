import { forwardToService, ServiceError } from "@be/agent/lib/client";
import { getDomainSchemas } from "@be/agent/lib/schema-registry";
import { authMiddleware } from "@be/agent/middleware/auth";
import { Elysia, t } from "elysia";

export const intelligenceRoutes = new Elysia({ prefix: "/intelligence" })
	.use(authMiddleware)
	.get(
		"/schema",
		() => ({
			domain: "intelligence",
			endpoints: getDomainSchemas("intelligence"),
		}),
		{
			detail: {
				summary: "Intelligence Schemas",
				description:
					"Returns email verification & domain reputation inspection schemas for AI agents.",
				tags: ["Intelligence"],
			},
		},
	)
	.post(
		"/check-temp-email",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "tools",
					path: "/api/tools/v1/temp-email-checker",
					method: "POST",
					userId,
					organizationId,
					body,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			body: t.Object({
				email: t.String({ description: "Email address or domain to check" }),
			}),
			detail: {
				summary: "Check Disposable / Temp Email",
				description:
					"Checks if an email is disposable, a role address, or from a free consumer provider.",
				tags: ["Intelligence"],
			},
		},
	)
	.post(
		"/check-bimi",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "tools",
					path: "/api/tools/v1/bimi-check",
					method: "POST",
					userId,
					organizationId,
					body,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			body: t.Object({
				domain: t.String({ description: "Domain name, e.g. example.com" }),
			}),
			detail: {
				summary: "Check BIMI & DMARC",
				description:
					"Looks up BIMI records, confirms logo URL accessibility, and verifies DMARC enforcement.",
				tags: ["Intelligence"],
			},
		},
	)
	.post(
		"/check-domain-age",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "tools",
					path: "/api/tools/v1/domain-age",
					method: "POST",
					userId,
					organizationId,
					body,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			body: t.Object({
				domain: t.String(),
			}),
			detail: {
				summary: "Check Domain Age",
				description:
					"Inspects domain registration date and domain age to assess deliverability risk.",
				tags: ["Intelligence"],
			},
		},
	)
	.post(
		"/check-domain-reputation",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "tools",
					path: "/api/tools/v1/domain-reputation",
					method: "POST",
					userId,
					organizationId,
					body,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			body: t.Object({
				domain: t.String(),
			}),
			detail: {
				summary: "Check Domain Reputation",
				description:
					"Inspects spam scores, blocklists, and risk indicators for a domain.",
				tags: ["Intelligence"],
			},
		},
	);
