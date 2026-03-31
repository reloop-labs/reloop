import { createWebhookRoute } from "@reloop/webhook/routes/webhook/create-webhook/create-webhook.route";
import { deleteWebhookRoute } from "@reloop/webhook/routes/webhook/delete-webhook/delete-webhook.route";
import { getWebhookRoute } from "@reloop/webhook/routes/webhook/get-webhook/get-webhook.route";
import { listWebhooksRoute } from "@reloop/webhook/routes/webhook/list-webhooks/list-webhooks.route";
import { updateWebhookRoute } from "@reloop/webhook/routes/webhook/update-webhook/update-webhook.route";
import { Elysia } from "elysia";

export const webhookRoutes = new Elysia({
	prefix: "/v1",
	name: "WebhookRoutes",
})
	.use(listWebhooksRoute)
	.use(createWebhookRoute)
	.use(getWebhookRoute)
	.use(updateWebhookRoute)
	.use(deleteWebhookRoute);
