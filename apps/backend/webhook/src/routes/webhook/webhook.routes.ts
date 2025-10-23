import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { createWebhookRoute } from "@reloop/webhook/routes/webhook/routes/create-webhook.route";
import { deleteWebhookRoute } from "@reloop/webhook/routes/webhook/routes/delete-webhook.route";
import { getWebhookRoute } from "@reloop/webhook/routes/webhook/routes/get-webhook.route";
import { listWebhooksRoute } from "@reloop/webhook/routes/webhook/routes/list-webhooks.route";
import { updateWebhookRoute } from "@reloop/webhook/routes/webhook/routes/update-webhook.route";
import { Elysia } from "elysia";

export const webhookRoutes = new Elysia({
    prefix: "/v1",
    name: "WebhookRoutes",
})
    .use(authMiddleware)
    .use(createWebhookRoute)
    .use(getWebhookRoute)
    .use(updateWebhookRoute)
    .use(deleteWebhookRoute)
    .use(listWebhooksRoute);
