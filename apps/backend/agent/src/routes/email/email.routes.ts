import { forwardToService, ServiceError } from "@be/agent/lib/client";
import { getDomainSchemas } from "@be/agent/lib/schema-registry";
import { authMiddleware } from "@be/agent/middleware/auth";
import { Elysia, t } from "elysia";

export const emailRoutes = new Elysia({ prefix: "/email" })
	.use(authMiddleware)
	.get(
		"/schema",
		() => ({
			domain: "email",
			endpoints: getDomainSchemas("email"),
		}),
		{
			detail: {
				summary: "Email Domain Schemas",
				description:
					"Returns the available email sending & analytics schemas for AI agents.",
				tags: ["Email"],
			},
		},
	)
	.post(
		"/send",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "mail",
					path: "/api/mail/v1/send",
					method: "POST",
					userId,
					organizationId,
					body,
				});

				return {
					success: true,
					data: response,
					warnings: [],
				};
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
						link: err.link,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			body: t.Object({
				to: t.Union([t.String(), t.Array(t.String())]),
				subject: t.String(),
				text: t.Optional(t.String()),
				html: t.Optional(t.String()),
				from: t.Optional(t.String()),
				replyTo: t.Optional(t.String()),
				cc: t.Optional(t.Union([t.String(), t.Array(t.String())])),
				bcc: t.Optional(t.Union([t.String(), t.Array(t.String())])),
			}),
			detail: {
				summary: "Send Email",
				description:
					"Dispatches an email with structured tracking and deliverability feedback.",
				tags: ["Email"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "logs",
					path: `/api/logs/v1/emails/${params.id}`,
					method: "GET",
					userId,
					organizationId,
				});
				return {
					success: true,
					data: response,
				};
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
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				summary: "Get Email Status",
				description:
					"Retrieves delivery events, timestamps, and bounce reasons for an email.",
				tags: ["Email"],
			},
		},
	)
	.get(
		"/list",
		async ({ query, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "logs",
					path: "/api/logs/v1/emails",
					method: "GET",
					userId,
					organizationId,
					query,
				});
				return {
					success: true,
					data: response,
				};
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
					recipient: t.Optional(t.String()),
					status: t.Optional(t.String()),
					domain: t.Optional(t.String()),
				}),
			),
			detail: {
				summary: "List Sent Emails",
				description: "Retrieves paginated history of sent emails.",
				tags: ["Email"],
			},
		},
	)
	.post(
		"/:id/resend",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "mail",
					path: `/api/mail/v1/resend/${params.id}`,
					method: "POST",
					userId,
					organizationId,
				});
				return {
					success: true,
					data: response,
				};
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
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				summary: "Resend Email",
				description: "Resends a previously sent email by ID.",
				tags: ["Email"],
			},
		},
	)
	.get(
		"/stats",
		async ({ query, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "logs",
					path: "/api/logs/v1/emails/stats",
					method: "GET",
					userId,
					organizationId,
					query,
				});
				return {
					success: true,
					data: response,
				};
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
					startDate: t.Optional(t.String()),
					endDate: t.Optional(t.String()),
				}),
			),
			detail: {
				summary: "Email Metrics",
				description: "Aggregate delivery, open, and bounce statistics.",
				tags: ["Email"],
			},
		},
	);
