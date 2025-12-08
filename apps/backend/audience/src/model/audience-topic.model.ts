import { t } from "elysia";

export namespace AudienceTopicModel {
  // Create Audience Topic
  export const createAudienceTopicBody = t.Object({
    name: t.String({
      minLength: 1,
      maxLength: 255,
      description: "Audience topic name",
    }),
    description: t.Optional(
      t.String({
        maxLength: 1000,
        description: "Audience topic description",
      }),
    ),
  });

  export type CreateAudienceTopicBody = typeof createAudienceTopicBody.static;

  // Update Audience Topic
  export const updateAudienceTopicBody = t.Object({
    name: t.Optional(
      t.String({
        minLength: 1,
        maxLength: 255,
        description: "Audience topic name",
      }),
    ),
    description: t.Optional(
      t.String({
        maxLength: 1000,
        description: "Audience topic description",
      }),
    ),
  });

  export type UpdateAudienceTopicBody = typeof updateAudienceTopicBody.static;

  // Audience Topic Response
  export const audienceTopicResponse = t.Object({
    id: t.String({ description: "Unique audience topic identifier" }),
    name: t.String({ description: "Audience topic name" }),
    description: t.Union([t.String(), t.Null()], {
      description: "Audience topic description",
    }),
    organizationId: t.String({ description: "Organization ID" }),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    deletedAt: t.Union([t.Date(), t.Null()]),
  });

  export type AudienceTopicResponse = typeof audienceTopicResponse.static;

  // Audience Topic List Response
  export const audienceTopicListResponse = t.Object({
    audienceTopics: t.Array(audienceTopicResponse),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
  });

  export type AudienceTopicListResponse = typeof audienceTopicListResponse.static;

  // Query
  export const audienceTopicQuery = t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    search: t.Optional(t.String({ description: "Search by name" })),
  });

  export type AudienceTopicQuery = typeof audienceTopicQuery.static;

  // Delete Response
  export const deleteResponse = t.Object({
    success: t.Boolean(),
  });

  export type DeleteResponse = typeof deleteResponse.static;

  // Error Responses
  export const audienceTopicNotFound = t.Object({
    message: t.Literal("Audience topic not found"),
  });
  export type AudienceTopicNotFound = typeof audienceTopicNotFound.static;

  export const audienceTopicAlreadyExists = t.Object({
    message: t.Literal("Audience topic already exists"),
  });
  export type AudienceTopicAlreadyExists = typeof audienceTopicAlreadyExists.static;

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
