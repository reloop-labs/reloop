import { authMiddleware } from "@be/audience/middleware/auth";
import { TopicSubscriptionModel } from "@be/audience/model/topic-subscription.model";
import { deleteTopicSubscriptionHandler } from "@be/audience/routes/audience-topic-mapper/controllers/delete-audience-topic-mapper";
import { Elysia, t } from "elysia";

export const deleteTopicSubscriptionRoute = new Elysia().use(authMiddleware).delete(
  "/:subscriptionId",
  async ({ params, user }) => {
    const { subscriptionId } = params;
    return await deleteTopicSubscriptionHandler(subscriptionId, user.activeOrganizationId);
  },
  {
    auth: true,
    params: t.Object({
      subscriptionId: t.String({ description: "Subscription ID" }),
    }),
    response: {
      200: TopicSubscriptionModel.deleteResponse,
      404: TopicSubscriptionModel.notFound,
      403: TopicSubscriptionModel.unauthorized,
    },
    detail: {
      tags: ["Topic Subscriptions"],
      summary: "Delete a topic subscription",
      description: "Soft deletes a topic subscription",
    },
  },
);
