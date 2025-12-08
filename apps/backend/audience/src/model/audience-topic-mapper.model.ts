import { t } from "elysia";

export namespace AudienceTopicMapperModel {
  // Create Audience Topic Mapper
  export const createAudienceTopicMapperBody = t.Object({
    audienceId: t.String({ description: "Audience ID" }),
    audienceTopicId: t.String({ description: "Audience topic ID" }),
    status: t.Optional(
      t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
        default: "subscribed",
        description: "Subscription status",
      }),
    ),
  });

  export type CreateAudienceTopicMapperBody = typeof createAudienceTopicMapperBody.static;

  // Update Audience Topic Mapper
  export const updateAudienceTopicMapperBody = t.Object({
    status: t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
      description: "Subscription status",
    }),
  });

  export type UpdateAudienceTopicMapperBody = typeof updateAudienceTopicMapperBody.static;

  // Audience Topic Mapper Response
  export const audienceTopicMapperResponse = t.Object({
    id: t.String({ description: "Unique mapper identifier" }),
    audienceId: t.String({ description: "Audience ID" }),
    audienceTopicId: t.String({ description: "Audience topic ID" }),
    organizationId: t.String({ description: "Organization ID" }),
    status: t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
      description: "Subscription status",
    }),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    deletedAt: t.Union([t.Date(), t.Null()]),
  });

  export type AudienceTopicMapperResponse = typeof audienceTopicMapperResponse.static;

  // Audience Topic Mapper List Response
  export const audienceTopicMapperListResponse = t.Object({
    mappings: t.Array(audienceTopicMapperResponse),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
  });

  export type AudienceTopicMapperListResponse = typeof audienceTopicMapperListResponse.static;

  // Query
  export const audienceTopicMapperQuery = t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    audienceId: t.Optional(t.String({ description: "Filter by audience ID" })),
    audienceTopicId: t.Optional(t.String({ description: "Filter by topic ID" })),
    status: t.Optional(
      t.Union([t.Literal("subscribed"), t.Literal("unsubscribed")], {
        description: "Filter by subscription status",
      }),
    ),
  });

  export type AudienceTopicMapperQuery = typeof audienceTopicMapperQuery.static;

  // Delete Response
  export const deleteResponse = t.Object({
    success: t.Boolean(),
  });

  export type DeleteResponse = typeof deleteResponse.static;

  // Error Responses
  export const notFound = t.Object({
    message: t.Literal("Audience topic mapping not found"),
  });
  export type NotFound = typeof notFound.static;

  export const mappingAlreadyExists = t.Object({
    message: t.Literal("Audience is already mapped to this topic"),
  });
  export type MappingAlreadyExists = typeof mappingAlreadyExists.static;

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
