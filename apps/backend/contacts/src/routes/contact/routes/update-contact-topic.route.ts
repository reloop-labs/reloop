import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { updateContactTopic } from "@be/contacts/routes/contact/controllers/update-contact-topic";
import { Elysia, t } from "elysia";

export const updateContactTopicRoute = new Elysia().use(authMiddleware).patch(
  "/topics/update",
  async ({ body, activeOrganizationId, userId, logger }) => {
    return await updateContactTopic(activeOrganizationId, userId, body, logger);
  },
  {
    auth: true,
    body: ContactModel.updateContactTopicBody,
    response: {
      200: ContactModel.updateContactTopicResponse,
      400: t.Object({ message: t.String() }),
      404: t.Object({ message: t.String() }),
    },
    detail: {
      tags: ["Contact"],
      summary: "Update Contact Topic",
      description: "Updates a contact's enrollment status in a topic",
    },
  },
);
