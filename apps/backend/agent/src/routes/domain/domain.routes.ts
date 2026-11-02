import { forwardToService, ServiceError } from "@be/agent/lib/client";
import { getDomainSchemas } from "@be/agent/lib/schema-registry";
import { authMiddleware } from "@be/agent/middleware/auth";
import { Elysia, t } from "elysia";

export const domainRoutes = new Elysia({ prefix: "/domain" })
	.use(authMiddleware)
	.get(
		"/schema",
		() => ({
			domain: "domain",
			endpoints: getDomainSchemas("domain"),
		}),
		{
			detail: {
				summary: "Domain Schemas",
				description:
					"Returns sending domain & DNS verification schemas for AI agents.",
				tags: ["Domain"],
			},
		},
	)
	.get(
		"/list",
		async ({ set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "domain",
					path: "/api/domain/v1/list",
					method: "GET",
					userId,
					organizationId,
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
			detail: {
				summary: "List Domains",
				description:
					"Lists registered sending domains and their DNS verification status.",
				tags: ["Domain"],
			},
		},
	)
	.post(
		"/create",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "domain",
					path: "/api/domain/v1/create",
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
				name: t.String(),
			}),
			detail: {
				summary: "Register Domain",
				description:
					"Registers a domain and generates SPF, DKIM, DMARC DNS records.",
				tags: ["Domain"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "domain",
					path: `/api/domain/v1/${params.id}`,
					method: "GET",
					userId,
					organizationId,
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
			params: t.Object({ id: t.String() }),
			detail: {
				summary: "Get Domain",
				description: "Retrieves details and DNS configuration for a domain.",
				tags: ["Domain"],
			},
		},
	)
	.post(
		"/:id/verify",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "domain",
					path: `/api/domain/v1/verify/${params.id}`,
					method: "POST",
					userId,
					organizationId,
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
			params: t.Object({ id: t.String() }),
			detail: {
				summary: "Verify Domain DNS",
				description: "Triggers DNS check to confirm active SPF and DKIM setup.",
				tags: ["Domain"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params, body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "domain",
					path: `/api/domain/v1/${params.id}`,
					method: "PATCH",
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
			params: t.Object({ id: t.String() }),
			body: t.Object({
				openTracking: t.Optional(t.Boolean()),
				clickTracking: t.Optional(t.Boolean()),
			}),
			detail: {
				summary: "Update Domain",
				description: "Configures domain settings.",
				tags: ["Domain"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "domain",
					path: `/api/domain/v1/${params.id}`,
					method: "DELETE",
					userId,
					organizationId,
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
			params: t.Object({ id: t.String() }),
			detail: {
				summary: "Delete Domain",
				description: "Removes a domain from the workspace.",
				tags: ["Domain"],
			},
		},
	);
