import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicSubscriptionModel } from "@be/contacts/model/topic-subscription.model";
import { subscribeContactHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/subscribe-contact";
import { Elysia } from "elysia";

export const subscribeContactRoute = new Elysia().use(authMiddleware).post(
  "/subscribe",
  async ({ body, user }) => {
    const { activeOrganizationId } = user;
    return await subscribeContactHandler(activeOrganizationId, body);
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
      summary: "Subscribe contact to topic",
      description: "Updates the subscription status to subscribed for a contact-topic pair",
    },
  },
);
