import { t } from "elysia";

export namespace ContactModel {
  // Email validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Contact Models
  export const createContactBody = t.Object({
    email: t.String({
      pattern: emailPattern.source,
      description: "Contact email address",
    }),
    firstName: t.Optional(
      t.String({
        maxLength: 255,
        description: "Contact first name",
      }),
    ),
    lastName: t.Optional(
      t.String({
        maxLength: 255,
        description: "Contact last name",
      }),
    ),
  });

  export type CreateContactBody = typeof createContactBody.static;

  export const updateContactBody = t.Object({
    firstName: t.Optional(
      t.String({
        maxLength: 255,
        description: "Contact first name",
      }),
    ),
    lastName: t.Optional(
      t.String({
        maxLength: 255,
        description: "Contact last name",
      }),
    ),
  });

  export type UpdateContactBody = typeof updateContactBody.static;

  export const contactResponse = t.Object({
    id: t.String({ description: "Unique contact identifier" }),
    email: t.String({ description: "Contact email address" }),
    firstName: t.Union([t.String(), t.Null()], {
      description: "Contact first name",
    }),
    lastName: t.Union([t.String(), t.Null()], {
      description: "Contact last name",
    }),
    organizationId: t.String({ description: "Organization ID" }),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    deletedAt: t.Union([t.Date(), t.Null()]),
  });

  export type ContactResponse = typeof contactResponse.static;

  export const contactListResponse = t.Object({
    contacts: t.Array(contactResponse),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
  });

  export type ContactListResponse = typeof contactListResponse.static;

  export const contactQuery = t.Object({
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    search: t.Optional(t.String({ description: "Search by email or name" })),
    organizationId: t.Optional(t.String()),
  });

  export type ContactQuery = typeof contactQuery.static;

  // Search Models
  export const searchContactsQuery = t.Object({
    query: t.String({
      minLength: 1,
      description: "Search query",
    }),
    page: t.Optional(t.Number({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    organizationId: t.Optional(t.String()),
  });

  export type SearchContactsQuery = typeof searchContactsQuery.static;

  // Delete Response
  export const deleteResponse = t.Object({
    success: t.Boolean(),
  });

  export type DeleteResponse = typeof deleteResponse.static;

  // Error Responses
  export const contactNotFound = t.Object({
    message: t.Literal("Contact not found"),
  });
  export type ContactNotFound = typeof contactNotFound.static;

  export const contactAlreadyExists = t.Object({
    message: t.Literal("Contact already exists"),
  });
  export type ContactAlreadyExists = typeof contactAlreadyExists.static;

  export const invalidEmail = t.Object({
    message: t.Literal("Invalid email format"),
  });
  export type InvalidEmail = typeof invalidEmail.static;

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

  // Bulk Import Models
  export const bulkImportContactItem = t.Object({
    email: t.String({
      pattern: emailPattern.source,
      description: "Contact email address",
    }),
    firstName: t.Optional(t.String({ maxLength: 255 })),
    lastName: t.Optional(t.String({ maxLength: 255 })),
  });

  export const bulkImportContactsBody = t.Object({
    contacts: t.Array(bulkImportContactItem, {
      minItems: 1,
      maxItems: 1000,
      description: "Array of contacts to import",
    }),
  });

  export type BulkImportContactsBody = typeof bulkImportContactsBody.static;

  export const bulkImportResponse = t.Object({
    created: t.Number({ description: "Number of contacts created" }),
    skipped: t.Number({ description: "Number of contacts skipped (already exist)" }),
    errors: t.Array(
      t.Object({
        email: t.String(),
        reason: t.String(),
      }),
    ),
  });

  export type BulkImportResponse = typeof bulkImportResponse.static;
}
