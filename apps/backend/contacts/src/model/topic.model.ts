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
    defaultSubscription: t.Optional(
      t.Union([t.Literal("opt_in"), t.Literal("opt_out")], {
        default: "opt_in",
        description: "Default subscription setting",
      }),
    ),
    visibility: t.Optional(
      t.Union([t.Literal("private"), t.Literal("public")], {
        default: "private",
        description: "Visibility setting - whether the topic is visible to everyone or just the team",
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
      t.Union([
        t.String({
          maxLength: 1000,
          description: "Topic description",
        }),
        t.Null(),
      ]),
    ),
    defaultSubscription: t.Optional(
      t.Union([t.Literal("opt_in"), t.Literal("opt_out")], {
        description: "Default subscription setting",
      }),
    ),
    visibility: t.Optional(
      t.Union([t.Literal("private"), t.Literal("public")], {
        description: "Visibility setting - whether the topic is visible to everyone or just the team",
      }),
    ),
  });

  export type UpdateTopicBody = typeof updateTopicBody.static;

  // Topic Response
  export const topicResponse = t.Object({
    object: t.Literal("topic", { default: "topic" }),
    id: t.String({ description: "Unique topic identifier" }),
    name: t.String({ description: "Topic name" }),
    description: t.Union([t.String(), t.Null()], {
      description: "Topic description",
    }),
    defaultSubscription: t.Union([t.Literal("opt_in"), t.Literal("opt_out")], {
      description: "Default subscription setting",
    }),
    visibility: t.Union([t.Literal("private"), t.Literal("public")], {
      description: "Visibility setting - whether the topic is visible to everyone or just the team",
    }),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  });

  export type TopicResponse = typeof topicResponse.static;

  export const topicListItem = t.Omit(topicResponse, ["object"]);
  export type TopicListItem = typeof topicListItem.static;

  // Topic List Response
  export const topicListResponse = t.Object({
    object: t.Literal("topic", { default: "topic" }),
    topics: t.Array(topicListItem),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
  });

  export type TopicListResponse = typeof topicListResponse.static;

  // Query
  export const topicQuery = t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 1000, default: 100 })),
    search: t.Optional(t.String({ description: "Search by name" })),
  });

  export type TopicQuery = typeof topicQuery.static;

  // Delete Response
  export const deleteResponse = t.Object({
    object: t.Literal("topic", { default: "topic" }),
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
