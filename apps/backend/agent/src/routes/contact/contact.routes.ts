import { forwardToService, ServiceError } from "@be/agent/lib/client";
import { getDomainSchemas } from "@be/agent/lib/schema-registry";
import { authMiddleware } from "@be/agent/middleware/auth";
import { Elysia, t } from "elysia";

export const contactRoutes = new Elysia({ prefix: "/contact" })
	.use(authMiddleware)
	.get(
		"/schema",
		() => ({
			domain: "contact",
			endpoints: getDomainSchemas("contact"),
		}),
		{
			detail: {
				summary: "Contact & Group Schemas",
				description:
					"Returns contact management and segment schemas for AI agents.",
				tags: ["Contact"],
			},
		},
	)
	.get(
		"/list",
		async ({ query, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "contacts",
					path: "/api/contacts/v1/list",
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
					search: t.Optional(t.String()),
				}),
			),
			detail: {
				summary: "List Contacts",
				description:
					"Lists contacts in the workspace with pagination and search.",
				tags: ["Contact"],
			},
		},
	)
	.post(
		"/create",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "contacts",
					path: "/api/contacts/v1/create",
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
				email: t.String(),
				firstName: t.Optional(t.String()),
				lastName: t.Optional(t.String()),
				properties: t.Optional(t.Record(t.String(), t.Any())),
			}),
			detail: {
				summary: "Create Contact",
				description: "Creates a new contact record with properties.",
				tags: ["Contact"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "contacts",
					path: `/api/contacts/v1/${params.id}`,
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
				summary: "Get Contact",
				description: "Retrieves a contact's profile and custom attributes.",
				tags: ["Contact"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params, body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "contacts",
					path: `/api/contacts/v1/${params.id}`,
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
				firstName: t.Optional(t.String()),
				lastName: t.Optional(t.String()),
				properties: t.Optional(t.Record(t.String(), t.Any())),
			}),
			detail: {
				summary: "Update Contact",
				description: "Updates contact properties.",
				tags: ["Contact"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "contacts",
					path: `/api/contacts/v1/${params.id}`,
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
				summary: "Delete Contact",
				description: "Deletes a contact record.",
				tags: ["Contact"],
			},
		},
	)
	.get(
		"/groups",
		async ({ query, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "contacts",
					path: "/api/contacts/v1/groups",
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
				summary: "List Contact Groups",
				description: "Lists contact groups / audience segments.",
				tags: ["Contact"],
			},
		},
	)
	.post(
		"/groups",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "contacts",
					path: "/api/contacts/v1/groups",
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
				summary: "Create Contact Group",
				description: "Creates an audience group segment.",
				tags: ["Contact"],
			},
		},
	)
	.post(
		"/groups/:id/contacts",
		async ({ params, body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "contacts",
					path: `/api/contacts/group/${params.id}`,
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
				email: t.Optional(t.String()),
				contact_id: t.Optional(t.String()),
			}),
			detail: {
				summary: "Add Contact to Group",
				description:
					"Adds a contact to a group segment by email or contact ID.",
				tags: ["Contact"],
			},
		},
	)
	.delete(
		"/groups/:id/contacts",
		async ({ params, body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "contacts",
					path: `/api/contacts/group/${params.id}`,
					method: "DELETE",
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
				email: t.Optional(t.String()),
				contact_id: t.Optional(t.String()),
			}),
			detail: {
				summary: "Remove Contact from Group",
				description: "Removes a contact from a group segment.",
				tags: ["Contact"],
			},
		},
	);
