import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicSubscriptionModel } from "@be/contacts/model/topic-subscription.model";
import { getTopicSubscriptionHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/get-contact-topic-mapper";
import { Elysia, t } from "elysia";

export const getTopicSubscriptionRoute = new Elysia().use(authMiddleware).get(
  "/:subscriptionId",
  async ({ params, user }) => {
    const { subscriptionId } = params;
    return await getTopicSubscriptionHandler(subscriptionId, user.activeOrganizationId);
  },
  {
    auth: true,
    params: t.Object({
      subscriptionId: t.String({ description: "Subscription ID" }),
    }),
    response: {
      200: TopicSubscriptionModel.topicSubscriptionResponse,
      404: TopicSubscriptionModel.notFound,
      403: TopicSubscriptionModel.unauthorized,
    },
    detail: {
      tags: ["Topic Subscriptions"],
      summary: "Get a topic subscription",
      description: "Retrieves a specific topic subscription by ID",
    },
  },
);
