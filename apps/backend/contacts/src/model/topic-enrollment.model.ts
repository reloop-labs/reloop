import { t } from "elysia";

export namespace TopicEnrollmentModel {
  // Create Topic Enrollment
  export const createTopicEnrollmentBody = t.Object({
    contactId: t.String({ description: "Contact ID" }),
    topicId: t.String({ description: "Topic ID" }),
    status: t.Optional(
      t.Union([t.Literal("enrolled"), t.Literal("unenrolled")], {
        default: "enrolled",
        description: "Enrollment status",
      }),
    ),
  });

  export type CreateTopicEnrollmentBody = typeof createTopicEnrollmentBody.static;

  // Update Topic Enrollment
  export const updateTopicEnrollmentBody = t.Object({
    status: t.Union([t.Literal("enrolled"), t.Literal("unenrolled")], {
      description: "Enrollment status",
    }),
  });

  export type UpdateTopicEnrollmentBody = typeof updateTopicEnrollmentBody.static;

  // Topic Enrollment Response
  export const topicEnrollmentResponse = t.Object({
    id: t.String({ description: "Unique enrollment identifier" }),
    contactId: t.String({ description: "Contact ID" }),
    topicId: t.String({ description: "Topic ID" }),
    organizationId: t.String({ description: "Organization ID" }),
    status: t.Union([t.Literal("enrolled"), t.Literal("unenrolled")], {
      description: "Enrollment status",
    }),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    deletedAt: t.Union([t.Date(), t.Null()]),
    contact: t.Optional(
      t.Object({
        id: t.String(),
        email: t.String(),
        status: t.String(),
        organizationId: t.String(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        deletedAt: t.Union([t.Date(), t.Null()]),
      }),
    ),
  });

  export type TopicEnrollmentResponse = typeof topicEnrollmentResponse.static;

  // Topic Enrollment List Response
  export const topicEnrollmentListResponse = t.Object({
    enrollments: t.Array(topicEnrollmentResponse),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
  });

  export type TopicEnrollmentListResponse = typeof topicEnrollmentListResponse.static;

  // Query
  export const topicEnrollmentQuery = t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    contactId: t.Optional(t.String({ description: "Filter by contact ID" })),
    topicId: t.Optional(t.String({ description: "Filter by topic ID" })),
    status: t.Optional(
      t.Union([t.Literal("enrolled"), t.Literal("unenrolled")], {
        description: "Filter by enrollment status",
      }),
    ),
  });

  export type TopicEnrollmentQuery = typeof topicEnrollmentQuery.static;

  // Delete Response
  export const deleteResponse = t.Object({
    success: t.Boolean(),
  });

  export type DeleteResponse = typeof deleteResponse.static;

  // Error Responses
  export const notFound = t.Object({
    message: t.Literal("Topic enrollment not found"),
  });
  export type NotFound = typeof notFound.static;

  export const enrollmentAlreadyExists = t.Object({
    message: t.Literal("Contact is already enrolled in this topic"),
  });
  export type EnrollmentAlreadyExists = typeof enrollmentAlreadyExists.static;

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

  // Unenroll Model
  export const unenrollBody = t.Object({
    contactId: t.String({ description: "Contact ID to unenroll" }),
    topicId: t.String({ description: "Topic ID to unenroll from" }),
  });

  export type UnenrollBody = typeof unenrollBody.static;

  // Bulk Add Contacts to Topic
  export const bulkEnrollContactsBody = t.Object({
    topicId: t.String({ description: "Topic ID to enroll contacts in" }),
    contactIds: t.Array(t.String(), {
      minItems: 1,
      maxItems: 1000,
      description: "Array of contact IDs to enroll",
    }),
  });

  export type BulkEnrollContactsBody = typeof bulkEnrollContactsBody.static;

  export const bulkEnrollResponse = t.Object({
    enrolled: t.Number({ description: "Number of contacts enrolled" }),
    skipped: t.Number({ description: "Number of contacts skipped (already enrolled)" }),
    errors: t.Array(
      t.Object({
        contactId: t.String(),
        reason: t.String(),
      }),
    ),
  });

  export type BulkEnrollResponse = typeof bulkEnrollResponse.static;
}
