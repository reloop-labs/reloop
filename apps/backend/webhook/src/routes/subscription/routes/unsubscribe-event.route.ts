import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { unsubscribeEventHandler } from "@reloop/webhook/routes/subscription/controllers/unsubscribe-event";
import { SubscriptionModel } from "@reloop/webhook/routes/subscription/subscription.model";
import { Elysia, status, t } from "elysia";

export const unsubscribeEventRoute = new Elysia().use(authMiddleware).delete(
    "/:webhookId/unsubscribe/:eventId",
    async ({ params: { webhookId, eventId }, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await unsubscribeEventHandler(
            webhookId,
            eventId,
            user.activeOrganizationId,
        );
    },
    {
        auth: true,
        params: t.Object({
            webhookId: SubscriptionModel.webhookIdParam,
            eventId: SubscriptionModel.eventIdParam,
        }),
        response: {
            200: t.Object({
                message: t.String(),
            }),
            404: SubscriptionModel.subscriptionNotFound,
            403: SubscriptionModel.unauthorized,
        },
        detail: {
            tags: ["Subscriptions"],
            summary: "Unsubscribe webhook from event",
            description: "Unsubscribes a webhook from an event",
        },
    },
);
