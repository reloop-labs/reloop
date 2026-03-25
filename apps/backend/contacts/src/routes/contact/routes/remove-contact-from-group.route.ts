import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { removeContactFromGroup } from "@be/contacts/routes/contact/controllers/remove-contact-from-group";
import { Elysia, t } from "elysia";

export const removeContactFromGroupRoute = new Elysia().use(authMiddleware).delete(
  "/group/:group_id",
  async ({ body, params, activeOrganizationId, userId, logger }) => {
    return await removeContactFromGroup(
      activeOrganizationId,
      userId,
      params.group_id,
      body,
      logger,
    );
  },
  {
    auth: true,
    params: t.Object({ group_id: t.String() }),
    body: ContactModel.removeContactFromGroupBody,
    response: {
      200: ContactModel.removeContactFromGroupResponse,
      400: t.Object({ message: t.String() }),
      404: t.Object({ message: t.String() }),
    },
    detail: {
      tags: ["Contact"],
      summary: "Delete Contact Group",
      description: "Deletes a contact from a group by ID or email",
    },
  },
);
