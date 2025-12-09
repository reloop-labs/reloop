import { authMiddleware } from "@be/audience/middleware/auth";
import { TopicSubscriptionModel } from "@be/audience/model/topic-subscription.model";
import { createTopicSubscriptionHandler } from "@be/audience/routes/audience-topic-mapper/controllers/create-audience-topic-mapper";
import { Elysia } from "elysia";

export const createTopicSubscriptionRoute = new Elysia().use(authMiddleware).post(
  "/add",
  async ({ body, user }) => {
    const { activeOrganizationId: organizationId } = user;
    const { contactId, topicId, status } = body;
    return await createTopicSubscriptionHandler({
      organizationId,
      contactId,
      topicId,
      subscriptionStatus: status,
    });
  },
  {
    auth: true,
    body: TopicSubscriptionModel.createTopicSubscriptionBody,
    response: {
      201: TopicSubscriptionModel.topicSubscriptionResponse,
      409: TopicSubscriptionModel.subscriptionAlreadyExists,
      404: TopicSubscriptionModel.notFound,
      403: TopicSubscriptionModel.unauthorized,
    },
    detail: {
      tags: ["Topic Subscriptions"],
      summary: "Subscribe contact to a topic",
      description: "Creates a subscription between a contact and a topic",
    },
  },
);
