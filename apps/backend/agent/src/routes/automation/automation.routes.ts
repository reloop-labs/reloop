import { forwardToService, ServiceError } from "@be/agent/lib/client";
import { getDomainSchemas } from "@be/agent/lib/schema-registry";
import { authMiddleware } from "@be/agent/middleware/auth";
import { Elysia, t } from "elysia";

export const automationRoutes = new Elysia({ prefix: "/automation" })
	.use(authMiddleware)
	.get(
		"/schema",
		() => ({
			domain: "automation",
			endpoints: getDomainSchemas("automation"),
		}),
		{
			detail: {
				summary: "Automation Schemas",
				description:
					"Returns workflow and automated sequence schemas for AI agents.",
				tags: ["Automation"],
			},
		},
	)
	.get(
		"/list",
		async ({ query, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "workflow",
					path: "/api/workflow/v1/automation/list",
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
				summary: "List Automations",
				description: "Lists automated email sequences in the workspace.",
				tags: ["Automation"],
			},
		},
	)
	.post(
		"/create",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "workflow",
					path: "/api/workflow/v1/automation/create",
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
				description: t.Optional(t.String()),
			}),
			detail: {
				summary: "Create Automation",
				description: "Creates an email automation workflow.",
				tags: ["Automation"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "workflow",
					path: `/api/workflow/v1/automation/${params.id}`,
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
				summary: "Get Automation",
				description: "Retrieves details, triggers, and steps of an automation.",
				tags: ["Automation"],
			},
		},
	)
	.post(
		"/:id/activate",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "workflow",
					path: `/api/workflow/v1/automation/activate/${params.id}`,
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
				summary: "Activate Automation",
				description:
					"Activates an automation so contacts begin progressing through steps.",
				tags: ["Automation"],
			},
		},
	)
	.post(
		"/:id/pause",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "workflow",
					path: `/api/workflow/v1/automation/pause/${params.id}`,
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
				summary: "Pause Automation",
				description: "Pauses active enrollments in the automation.",
				tags: ["Automation"],
			},
		},
	)
	.post(
		"/:id/enroll",
		async ({ params, body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "workflow",
					path: `/api/workflow/v1/automation/enroll/${params.id}`,
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
				contactId: t.String(),
			}),
			detail: {
				summary: "Enroll Contact",
				description: "Enrolls a contact into the automated sequence.",
				tags: ["Automation"],
			},
		},
	);
