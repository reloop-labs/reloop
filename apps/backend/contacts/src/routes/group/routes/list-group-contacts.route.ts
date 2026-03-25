import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { listGroupContactsHandler } from "@be/contacts/routes/group/controllers/list-group-contacts";
import { Elysia, t } from "elysia";

export const listGroupContactsRoute = new Elysia().use(authMiddleware).get(
  "/:contact_group_id/contacts",
  async ({ params, query, activeOrganizationId, logger }) => {
    const { contact_group_id } = params;

    return await listGroupContactsHandler(
      activeOrganizationId as string,
      contact_group_id,
      query,
      logger,
    );
  },
  {
    auth: true,
    params: t.Object({
      contact_group_id: t.String({ description: "ID of the contact group" }),
    }),
    query: ContactModel.contactQuery,
    response: {
      200: ContactModel.contactListResponse,
      403: ContactModel.unauthorized,
    },
    detail: {
      tags: ["Groups"],
      summary: "List Contacts Group",
      description: "List all contacts belonging to a specific group",
    },
  },
);
