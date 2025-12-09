import { authMiddleware } from "@be/audience/middleware/auth";
import { TopicSubscriptionModel } from "@be/audience/model/topic-subscription.model";
import { listTopicSubscriptionsHandler } from "@be/audience/routes/audience-topic-mapper/controllers/list-audience-topic-mappers";
import { Elysia } from "elysia";

export const listTopicSubscriptionsRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, user }) => {
    return await listTopicSubscriptionsHandler(query, user.activeOrganizationId);
  },
  {
    auth: true,
    query: TopicSubscriptionModel.topicSubscriptionQuery,
    response: {
      200: TopicSubscriptionModel.topicSubscriptionListResponse,
      403: TopicSubscriptionModel.unauthorized,
    },
    detail: {
      tags: ["Topic Subscriptions"],
      summary: "List topic subscriptions",
      description: "Retrieves a paginated list of topic subscriptions",
    },
  },
);
