import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { bulkImportContactsHandler } from "@be/contacts/routes/contact/controllers/bulk-import-contacts";
import { Elysia } from "elysia";

export const bulkImportContactsRoute = new Elysia().use(authMiddleware).post(
  "/bulk-import",
  async ({ body, user }) => {
    const { activeOrganizationId } = user;
    return await bulkImportContactsHandler(activeOrganizationId, body);
  },
  {
    auth: true,
    body: ContactModel.bulkImportContactsBody,
    response: {
      200: ContactModel.bulkImportResponse,
      400: ContactModel.validationError,
      403: ContactModel.unauthorized,
    },
    detail: {
      tags: ["Contact"],
      summary: "Bulk import contacts",
      description: "Import multiple contacts at once. Existing contacts are skipped.",
    },
  },
);
