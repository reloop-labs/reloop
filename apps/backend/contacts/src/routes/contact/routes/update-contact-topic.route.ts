import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { updateContactTopic } from "@be/contacts/routes/contact/controllers/update-contact-topic";
import { Elysia, t } from "elysia";

export const updateContactTopicRoute = new Elysia().use(authMiddleware).patch(
  "/topic/:topic_id",
  async ({ body, params, activeOrganizationId, userId, logger }) => {
    return await updateContactTopic(
      activeOrganizationId,
      userId,
      params.topic_id,
      body,
      logger,
    );
  },
  {
    auth: true,
    params: t.Object({ topic_id: t.String() }),
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
