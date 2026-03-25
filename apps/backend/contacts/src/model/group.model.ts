import { t } from "elysia";

export namespace GroupModel {
  // Create Group
  export const createGroupBody = t.Object({
    name: t.String({
      minLength: 1,
      maxLength: 255,
      description: "Group name",
    }),
  });

  export type CreateGroupBody = typeof createGroupBody.static;

  // Update Group
  export const updateGroupBody = t.Object({
    name: t.String({
      minLength: 1,
      maxLength: 255,
      description: "Group name",
    }),
  });

  export type UpdateGroupBody = typeof updateGroupBody.static;

  // Group Response
  export const groupResponse = t.Object({
    object: t.Literal("contact_group", { default: "contact_group" }),
    id: t.String({ description: "Unique group identifier" }),
    name: t.String({ description: "Group name" }),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  });

  export type GroupResponse = typeof groupResponse.static;

  // Group List Response
  export const groupListResponse = t.Object({
    object: t.Literal("contact_group", { default: "contact_group" }),
    groups: t.Array(groupResponse),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
  });

  export type GroupListResponse = typeof groupListResponse.static;

  // Query
  export const groupQuery = t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 1000, default: 100 })),
    search: t.Optional(t.String({ description: "Search by name" })),
  });

  export type GroupQuery = typeof groupQuery.static;

  // Delete Response
  export const deleteResponse = t.Object({
    success: t.Boolean(),
  });

  export type DeleteResponse = typeof deleteResponse.static;

  // Error Responses
  export const groupNotFound = t.Object({
    message: t.Literal("Group not found"),
  });
  export type GroupNotFound = typeof groupNotFound.static;

  export const groupAlreadyExists = t.Object({
    message: t.Literal("Group already exists"),
  });
  export type GroupAlreadyExists = typeof groupAlreadyExists.static;

  export const unauthorized = t.Object({
    message: t.Literal("Unauthorized access"),
  });
  export type Unauthorized = typeof unauthorized.static;
}
