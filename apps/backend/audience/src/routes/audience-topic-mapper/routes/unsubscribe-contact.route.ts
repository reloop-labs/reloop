import { authMiddleware } from "@be/audience/middleware/auth";
import { TopicSubscriptionModel } from "@be/audience/model/topic-subscription.model";
import { unsubscribeContactHandler } from "@be/audience/routes/audience-topic-mapper/controllers/unsubscribe-contact";
import { Elysia } from "elysia";

export const unsubscribeContactRoute = new Elysia().use(authMiddleware).post(
  "/unsubscribe",
  async ({ body, user }) => {
    const { activeOrganizationId } = user;
    return await unsubscribeContactHandler(activeOrganizationId, body);
  },
  {
    auth: true,
    body: TopicSubscriptionModel.unsubscribeBody,
    response: {
      200: TopicSubscriptionModel.topicSubscriptionResponse,
      404: TopicSubscriptionModel.notFound,
      403: TopicSubscriptionModel.unauthorized,
    },
    detail: {
      tags: ["Topic Subscriptions"],
      summary: "Unsubscribe contact from topic",
      description: "Updates the subscription status to unsubscribed for a contact-topic pair",
    },
  },
);
