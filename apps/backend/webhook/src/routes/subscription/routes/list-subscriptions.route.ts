import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { listSubscriptionsHandler } from "@reloop/webhook/routes/subscription/controllers/list-subscriptions";
import { SubscriptionModel } from "@reloop/webhook/routes/subscription/subscription.model";
import { Elysia, status } from "elysia";

export const listSubscriptionsRoute = new Elysia().use(authMiddleware).get(
    "/list",
    async ({ query, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await listSubscriptionsHandler(query, user.activeOrganizationId);
    },
    {
        query: SubscriptionModel.subscriptionQuery,
        response: {
            200: SubscriptionModel.subscriptionListResponse,
            403: SubscriptionModel.unauthorized,
        },
        auth: true,
        detail: {
            tags: ["Subscriptions"],
            summary: "List subscriptions",
            description: "Retrieves a paginated list of webhook event subscriptions",
        },
    },
);
