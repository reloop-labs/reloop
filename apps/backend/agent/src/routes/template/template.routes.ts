import { forwardToService, ServiceError } from "@be/agent/lib/client";
import { getDomainSchemas } from "@be/agent/lib/schema-registry";
import { authMiddleware } from "@be/agent/middleware/auth";
import { Elysia, t } from "elysia";

export const templateRoutes = new Elysia({ prefix: "/template" })
	.use(authMiddleware)
	.get(
		"/schema",
		() => ({
			domain: "template",
			endpoints: getDomainSchemas("template"),
		}),
		{
			detail: {
				summary: "Template Schemas",
				description:
					"Returns email template creation & testing schemas for AI agents.",
				tags: ["Template"],
			},
		},
	)
	.get(
		"/list",
		async ({ query, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "template",
					path: "/api/template/v1/list",
					method: "GET",
					userId,
					organizationId,
					query,
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
			query: t.Optional(
				t.Object({
					page: t.Optional(t.Numeric()),
					limit: t.Optional(t.Numeric()),
				}),
			),
			detail: {
				summary: "List Templates",
				description: "Lists email templates in the workspace.",
				tags: ["Template"],
			},
		},
	)
	.post(
		"/create",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "template",
					path: "/api/template/v1/create",
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
				subject: t.String(),
				html: t.String({
					description: "Rendered HTML content with {{{variable}}} tags",
				}),
			}),
			detail: {
				summary: "Create Template",
				description:
					"Creates an email template with HTML content and variables.",
				tags: ["Template"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "template",
					path: `/api/template/v1/${params.id}`,
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
				summary: "Get Template",
				description: "Retrieves template metadata and content blocks.",
				tags: ["Template"],
			},
		},
	)
	.post(
		"/:id/send-test",
		async ({ params, body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "template",
					path: `/api/template/v1/${params.id}/test`,
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
			params: t.Object({ id: t.String() }),
			body: t.Object({
				to: t.String({
					description: "Email address to send test rendering to",
				}),
				variables: t.Optional(t.Record(t.String(), t.Any())),
			}),
			detail: {
				summary: "Send Test Template Email",
				description:
					"Renders and sends a test email of the template with test variables.",
				tags: ["Template"],
			},
		},
	);
