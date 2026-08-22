import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { Elysia, t } from "elysia";
import { proxyToWebhookService } from "./webhooks.proxy";

const webhookIdParam = t.String({
	minLength: 1,
	description: "Webhook ID",
});

function credentials(request: Request) {
	return {
		apiKey: request.headers.get("x-api-key") ?? undefined,
		cookie: request.headers.get("cookie") ?? undefined,
	};
}

export const webhooksRoutes = new Elysia({
	prefix: "/v1/webhooks",
	name: "WebhooksRoutes",
})
	.use(authMiddleware)
	.post(
		"/",
		async ({ body, request }) => {
			return proxyToWebhookService({
				method: "POST",
				path: "/v1",
				body,
				...credentials(request),
			});
		},
		{
			auth: true,
			detail: {
				tags: ["Webhooks"],
				summary: "Create webhook",
				description:
					"Creates a webhook for the active organization. Requires a logged-in user (session or API key).",
			},
		},
	)
	.get(
		"/",
		async ({ request }) => {
			const query = new URL(request.url).search;
			return proxyToWebhookService({
				method: "GET",
				path: "/v1",
				query,
				...credentials(request),
			});
		},
		{
			auth: true,
			detail: {
				tags: ["Webhooks"],
				summary: "List webhooks",
				description:
					"Lists webhooks for the active organization. Requires a logged-in user (session or API key).",
			},
		},
	)
	.get(
		"/:webhook_id",
		async ({ params: { webhook_id }, request }) => {
			return proxyToWebhookService({
				method: "GET",
				path: `/v1/${webhook_id}`,
				...credentials(request),
			});
		},
		{
			auth: true,
			params: t.Object({ webhook_id: webhookIdParam }),
			detail: {
				tags: ["Webhooks"],
				summary: "Get webhook",
				description:
					"Retrieves a webhook by its ID. Requires a logged-in user (session or API key) with access to the webhook's organization.",
			},
		},
	)
	.patch(
		"/:webhook_id",
		async ({ params: { webhook_id }, body, request }) => {
			return proxyToWebhookService({
				method: "PATCH",
				path: `/v1/${webhook_id}`,
				body,
				...credentials(request),
			});
		},
		{
			auth: true,
			params: t.Object({ webhook_id: webhookIdParam }),
			detail: {
				tags: ["Webhooks"],
				summary: "Update webhook",
				description:
					"Updates a webhook by its ID. Requires a logged-in user (session or API key) with access to the webhook's organization.",
			},
		},
	)
	.delete(
		"/:webhook_id",
		async ({ params: { webhook_id }, request }) => {
			return proxyToWebhookService({
				method: "DELETE",
				path: `/v1/${webhook_id}`,
				...credentials(request),
			});
		},
		{
			auth: true,
			params: t.Object({ webhook_id: webhookIdParam }),
			detail: {
				tags: ["Webhooks"],
				summary: "Delete webhook",
				description:
					"Soft deletes a webhook by its ID. Requires a logged-in user (session or API key) with access to the webhook's organization.",
			},
		},
	)
	.get(
		"/:webhook_id/deliveries",
		async ({ params: { webhook_id }, request }) => {
			const query = new URL(request.url).search;
			return proxyToWebhookService({
				method: "GET",
				path: `/v1/${webhook_id}/deliveries`,
				query,
				...credentials(request),
			});
		},
		{
			auth: true,
			params: t.Object({ webhook_id: webhookIdParam }),
			detail: {
				tags: ["Webhooks"],
				summary: "List webhook deliveries",
				description:
					"Fetches a paginated list of delivery attempts for a specific webhook. Requires a logged-in user (session or API key) with access to the webhook's organization.",
			},
		},
	)
	.post(
		"/deliveries/:delivery_id/retry",
		async ({ params: { delivery_id }, request }) => {
			return proxyToWebhookService({
				method: "POST",
				path: `/deliveries/${delivery_id}/retry`,
				...credentials(request),
			});
		},
		{
			auth: true,
			params: t.Object({
				delivery_id: t.String({
					minLength: 1,
					description: "Webhook Delivery ID",
				}),
			}),
			detail: {
				tags: ["Webhooks"],
				summary: "Retry webhook delivery",
				description:
					"Manually re-enqueues a specific webhook delivery attempt. Requires a logged-in user (session or API key) with access to the delivery's organization.",
			},
		},
	);
