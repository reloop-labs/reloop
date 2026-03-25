import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { addContactToGroup } from "@be/contacts/routes/contact/controllers/add-contact-to-group";
import { Elysia, t } from "elysia";

export const addContactToGroupRoute = new Elysia().use(authMiddleware).post(
  "/groups/add",
  async ({ body, activeOrganizationId, userId, logger }) => {
    return await addContactToGroup(activeOrganizationId, userId, body, logger);
  },
  {
    auth: true,
    body: ContactModel.addContactToGroupBody,
    response: {
      200: ContactModel.addContactToGroupResponse,
      400: t.Object({ message: t.String() }),
      404: t.Object({ message: t.String() }),
    },
    detail: {
      tags: ["Contact"],
      summary: "Add Contact Group",
      description: "Adds a contact to a group by ID or email",
    },
  },
);
