import { authMiddleware } from "@be/audience/middleware/auth";
import { TopicSubscriptionModel } from "@be/audience/model/topic-subscription.model";
import { updateTopicSubscriptionHandler } from "@be/audience/routes/audience-topic-mapper/controllers/update-audience-topic-mapper";
import { Elysia, t } from "elysia";

export const updateTopicSubscriptionRoute = new Elysia().use(authMiddleware).patch(
  "/:subscriptionId",
  async ({ params, body, user }) => {
    const { subscriptionId } = params;
    const { status } = body;
    return await updateTopicSubscriptionHandler({
      subscriptionId,
      organizationId: user.activeOrganizationId,
      subscriptionStatus: status,
    });
  },
  {
    auth: true,
    params: t.Object({
      subscriptionId: t.String({ description: "Subscription ID" }),
    }),
    body: TopicSubscriptionModel.updateTopicSubscriptionBody,
    response: {
      200: TopicSubscriptionModel.topicSubscriptionResponse,
      404: TopicSubscriptionModel.notFound,
      403: TopicSubscriptionModel.unauthorized,
    },
    detail: {
      tags: ["Topic Subscriptions"],
      summary: "Update a topic subscription",
      description: "Updates the status of a topic subscription",
    },
  },
);
