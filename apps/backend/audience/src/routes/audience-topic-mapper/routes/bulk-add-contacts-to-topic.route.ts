import { authMiddleware } from "@be/audience/middleware/auth";
import { TopicSubscriptionModel } from "@be/audience/model/topic-subscription.model";
import { bulkAddContactsToTopicHandler } from "@be/audience/routes/audience-topic-mapper/controllers/bulk-add-contacts-to-topic";
import { Elysia } from "elysia";

export const bulkAddContactsToTopicRoute = new Elysia().use(authMiddleware).post(
  "/bulk-add",
  async ({ body, user }) => {
    const { activeOrganizationId } = user;
    return await bulkAddContactsToTopicHandler(activeOrganizationId, body);
  },
  {
    auth: true,
    body: TopicSubscriptionModel.bulkAddContactsBody,
    response: {
      200: TopicSubscriptionModel.bulkAddResponse,
      404: TopicSubscriptionModel.notFound,
      400: TopicSubscriptionModel.validationError,
      403: TopicSubscriptionModel.unauthorized,
    },
    detail: {
      tags: ["Topic Subscriptions"],
      summary: "Bulk add contacts to topic",
      description: "Subscribe multiple contacts to an existing topic at once",
    },
  },
);
