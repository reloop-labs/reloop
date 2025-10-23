import { t } from "elysia";

export namespace SubscriptionModel {
    export const webhookIdParam = t.String({
        minLength: 1,
        description: "Webhook ID",
    });

    export const eventIdParam = t.String({
        minLength: 1,
        description: "Event ID",
    });

    export const subscribeBody = t.Object({
        eventIds: t.Array(t.String(), {
            minItems: 1,
            description: "Array of event IDs to subscribe to",
        }),
    });

    export type SubscribeBody = typeof subscribeBody.static;

    export const subscriptionResponse = t.Object({
        id: t.String({ description: "Unique subscription identifier" }),
        webhookId: t.String({ description: "Webhook ID" }),
        eventId: t.String({ description: "Event ID" }),
        isEnabled: t.Boolean({ description: "Whether the subscription is enabled" }),
        createdAt: t.String({ description: "Creation timestamp" }),
        updatedAt: t.String({ description: "Last update timestamp" }),
    });

    export type SubscriptionResponse = typeof subscriptionResponse.static;

    export const subscriptionListResponse = t.Object({
        subscriptions: t.Array(subscriptionResponse),
        total: t.Number(),
        page: t.Number(),
        limit: t.Number(),
    });

    export type SubscriptionListResponse = typeof subscriptionListResponse.static;

    export const subscriptionQuery = t.Object({
        page: t.Optional(t.Number({ minimum: 1, default: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
        webhookId: t.Optional(t.String()),
        eventId: t.Optional(t.String()),
        isEnabled: t.Optional(t.Boolean()),
    });

    export type SubscriptionQuery = typeof subscriptionQuery.static;

    // Error responses
    export const subscriptionNotFound = t.Object({
        message: t.Literal("Subscription not found"),
    });
    export type SubscriptionNotFound = typeof subscriptionNotFound.static;

    export const webhookNotFound = t.Object({
        message: t.Literal("Webhook not found"),
    });
    export type WebhookNotFound = typeof webhookNotFound.static;

    export const eventNotFound = t.Object({
        message: t.Literal("Event not found"),
    });
    export type EventNotFound = typeof eventNotFound.static;

    export const subscriptionAlreadyExists = t.Object({
        message: t.Literal("Subscription already exists"),
    });
    export type SubscriptionAlreadyExists = typeof subscriptionAlreadyExists.static;

    export const unauthorized = t.Object({
        message: t.Literal("Unauthorized access"),
    });
    export type Unauthorized = typeof unauthorized.static;
}
