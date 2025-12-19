import { t } from "elysia";

export namespace TopicModel {
  // Create Topic
  export const createTopicBody = t.Object({
    name: t.String({
      minLength: 1,
      maxLength: 255,
      description: "Topic name",
    }),
    description: t.Optional(
      t.String({
        maxLength: 1000,
        description: "Topic description",
      }),
    ),
    autoEnroll: t.Optional(
      t.Union([t.Literal("enabled"), t.Literal("disabled")], {
        default: "enabled",
        description: "Auto enroll setting - enabled means all contacts are automatically subscribed",
      }),
    ),
  });

  export type CreateTopicBody = typeof createTopicBody.static;

  // Update Topic
  export const updateTopicBody = t.Object({
    name: t.Optional(
      t.String({
        minLength: 1,
        maxLength: 255,
        description: "Topic name",
      }),
    ),
    description: t.Optional(
      t.String({
        maxLength: 1000,
        description: "Topic description",
      }),
    ),
    autoEnroll: t.Optional(
      t.Union([t.Literal("enabled"), t.Literal("disabled")], {
        description: "Auto enroll setting - enabled means all contacts are automatically subscribed",
      }),
    ),
  });

  export type UpdateTopicBody = typeof updateTopicBody.static;

  // Topic Response
  export const topicResponse = t.Object({
    id: t.String({ description: "Unique topic identifier" }),
    name: t.String({ description: "Topic name" }),
    description: t.Union([t.String(), t.Null()], {
      description: "Topic description",
    }),
    autoEnroll: t.Union([t.Literal("enabled"), t.Literal("disabled")], {
      description: "Auto enroll setting - enabled means all contacts are automatically subscribed",
    }),
    organizationId: t.String({ description: "Organization ID" }),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    deletedAt: t.Union([t.Date(), t.Null()]),
  });

  export type TopicResponse = typeof topicResponse.static;

  // Topic List Response
  export const topicListResponse = t.Object({
    topics: t.Array(topicResponse),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
  });

  export type TopicListResponse = typeof topicListResponse.static;

  // Query
  export const topicQuery = t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    search: t.Optional(t.String({ description: "Search by name" })),
  });

  export type TopicQuery = typeof topicQuery.static;

  // Delete Response
  export const deleteResponse = t.Object({
    success: t.Boolean(),
  });

  export type DeleteResponse = typeof deleteResponse.static;

  // Error Responses
  export const topicNotFound = t.Object({
    message: t.Literal("Topic not found"),
  });
  export type TopicNotFound = typeof topicNotFound.static;

  export const topicAlreadyExists = t.Object({
    message: t.Literal("Topic already exists"),
  });
  export type TopicAlreadyExists = typeof topicAlreadyExists.static;

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
}
