import { t } from "elysia";

export namespace TopicSubscriptionModel {
  // Create Topic Subscription
  export const createTopicSubscriptionBody = t.Object({
    contactId: t.String({ description: "Contact ID" }),
    topicId: t.String({ description: "Topic ID" }),
    status: t.Optional(
      t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
        default: "subscribed",
        description: "Subscription status",
      }),
    ),
  });

  export type CreateTopicSubscriptionBody = typeof createTopicSubscriptionBody.static;

  // Update Topic Subscription
  export const updateTopicSubscriptionBody = t.Object({
    status: t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
      description: "Subscription status",
    }),
  });

  export type UpdateTopicSubscriptionBody = typeof updateTopicSubscriptionBody.static;

  // Topic Subscription Response
  export const topicSubscriptionResponse = t.Object({
    id: t.String({ description: "Unique subscription identifier" }),
    contactId: t.String({ description: "Contact ID" }),
    topicId: t.String({ description: "Topic ID" }),
    organizationId: t.String({ description: "Organization ID" }),
    status: t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
      description: "Subscription status",
    }),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    deletedAt: t.Union([t.Date(), t.Null()]),
    contact: t.Optional(
      t.Object({
        id: t.String(),
        email: t.String(),
        firstName: t.Union([t.String(), t.Null()]),
        lastName: t.Union([t.String(), t.Null()]),
        organizationId: t.String(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        deletedAt: t.Union([t.Date(), t.Null()]),
      }),
    ),
  });

  export type TopicSubscriptionResponse = typeof topicSubscriptionResponse.static;

  // Topic Subscription List Response
  export const topicSubscriptionListResponse = t.Object({
    subscriptions: t.Array(topicSubscriptionResponse),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
  });

  export type TopicSubscriptionListResponse = typeof topicSubscriptionListResponse.static;

  // Query
  export const topicSubscriptionQuery = t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    contactId: t.Optional(t.String({ description: "Filter by contact ID" })),
    topicId: t.Optional(t.String({ description: "Filter by topic ID" })),
    status: t.Optional(
      t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
        description: "Filter by subscription status",
      }),
    ),
  });

  export type TopicSubscriptionQuery = typeof topicSubscriptionQuery.static;

  // Delete Response
  export const deleteResponse = t.Object({
    success: t.Boolean(),
  });

  export type DeleteResponse = typeof deleteResponse.static;

  // Error Responses
  export const notFound = t.Object({
    message: t.Literal("Topic subscription not found"),
  });
  export type NotFound = typeof notFound.static;

  export const subscriptionAlreadyExists = t.Object({
    message: t.Literal("Contact is already subscribed to this topic"),
  });
  export type SubscriptionAlreadyExists = typeof subscriptionAlreadyExists.static;

  export const unauthorized = t.Object({
    message: t.Literal("Unauthorized access"),
  });
  export type Unauthorized = typeof unauthorized.static;

  export const validationError = t.Object({
    message: t.String(),
    errors: t.Array(
      t.Object({
        field: t.String(),
        message: t.String(),
      }),
    ),
  });
  export type ValidationError = typeof validationError.static;

  // Unsubscribe Model
  export const unsubscribeBody = t.Object({
    contactId: t.String({ description: "Contact ID to unsubscribe" }),
    topicId: t.String({ description: "Topic ID to unsubscribe from" }),
  });

  export type UnsubscribeBody = typeof unsubscribeBody.static;

  // Bulk Add Contacts to Topic
  export const bulkAddContactsBody = t.Object({
    topicId: t.String({ description: "Topic ID to subscribe contacts to" }),
    contactIds: t.Array(t.String(), {
      minItems: 1,
      maxItems: 1000,
      description: "Array of contact IDs to subscribe",
    }),
  });

  export type BulkAddContactsBody = typeof bulkAddContactsBody.static;

  export const bulkAddResponse = t.Object({
    subscribed: t.Number({ description: "Number of contacts subscribed" }),
    skipped: t.Number({ description: "Number of contacts skipped (already subscribed)" }),
    errors: t.Array(
      t.Object({
        contactId: t.String(),
        reason: t.String(),
      }),
    ),
  });

  export type BulkAddResponse = typeof bulkAddResponse.static;
}
