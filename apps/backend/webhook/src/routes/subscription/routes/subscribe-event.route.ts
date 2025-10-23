import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { subscribeEventHandler } from "@reloop/webhook/routes/subscription/controllers/subscribe-event";
import { SubscriptionModel } from "@reloop/webhook/routes/subscription/subscription.model";
import { Elysia, status, t } from "elysia";

export const subscribeEventRoute = new Elysia().use(authMiddleware).post(
    "/:webhookId/subscribe",
    async ({ params: { webhookId }, body, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await subscribeEventHandler(
            webhookId,
            body,
            user.activeOrganizationId,
        );
    },
    {
        auth: true,
        params: t.Object({
            webhookId: SubscriptionModel.webhookIdParam,
        }),
        body: SubscriptionModel.subscribeBody,
        response: {
            201: t.Array(SubscriptionModel.subscriptionResponse),
            404: SubscriptionModel.webhookNotFound,
            403: SubscriptionModel.unauthorized,
        },
        detail: {
            tags: ["Subscriptions"],
            summary: "Subscribe webhook to events",
            description: "Subscribes a webhook to one or more events",
        },
    },
);
