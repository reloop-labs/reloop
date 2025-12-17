import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicSubscriptionModel } from "@be/contacts/model/topic-subscription.model";
import { removeContactFromTopicHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/remove-contact-from-topic";
import { Elysia, t } from "elysia";

export const removeContactFromTopicRoute = new Elysia().use(authMiddleware).post(
  "/remove",
  async ({ body, user }) => {
    const { activeOrganizationId } = user;
    return await removeContactFromTopicHandler(activeOrganizationId, body);
  },
  {
    auth: true,
    body: TopicSubscriptionModel.unsubscribeBody,
    response: {
      200: t.Object({ success: t.Boolean() }),
      404: TopicSubscriptionModel.notFound,
      403: TopicSubscriptionModel.unauthorized,
    },
    detail: {
      tags: ["Topic Subscriptions"],
      summary: "Remove contact from topic",
      description: "Removes a contact from a topic by soft-deleting the subscription",
    },
  },
);
