import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { createWebhookHandler } from "@reloop/webhook/routes/webhook/controllers/create-webhook";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, status } from "elysia";

export const createWebhookRoute = new Elysia().use(authMiddleware).post(
    "/add",
    async ({ body, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await createWebhookHandler(user.activeOrganizationId, user.id, body);
    },
    {
        auth: true,
        body: WebhookModel.createWebhookBody,
        response: {
            201: WebhookModel.webhookResponse,
            409: WebhookModel.webhookAlreadyExists,
            400: WebhookModel.invalidWebhookUrl,
            403: WebhookModel.unauthorized,
        },
        detail: {
            tags: ["Webhooks"],
            summary: "Create a new webhook",
            description: "Creates a new webhook for the user's organization",
        },
    },
);
