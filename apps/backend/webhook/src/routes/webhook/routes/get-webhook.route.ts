import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { getWebhookHandler } from "@reloop/webhook/routes/webhook/controllers/get-webhook";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, status, t } from "elysia";

export const getWebhookRoute = new Elysia().use(authMiddleware).get(
    "/:id",
    async ({ params: { id }, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await getWebhookHandler(id, user.activeOrganizationId);
    },
    {
        auth: true,
        params: t.Object({
            id: WebhookModel.webhookIdParam,
        }),
        response: {
            200: WebhookModel.webhookResponse,
            404: WebhookModel.webhookNotFound,
            403: WebhookModel.unauthorized,
        },
        detail: {
            tags: ["Webhooks"],
            summary: "Get webhook by ID",
            description: "Retrieves a webhook by its ID",
        },
    },
);
