import { authMiddleware } from "@be/audience/middleware/auth";
import { bulkAddContactsToTopicRoute } from "@be/audience/routes/audience-topic-mapper/routes/bulk-add-contacts-to-topic.route";
import { createTopicSubscriptionRoute } from "@be/audience/routes/audience-topic-mapper/routes/create-audience-topic-mapper.route";
import { deleteTopicSubscriptionRoute } from "@be/audience/routes/audience-topic-mapper/routes/delete-audience-topic-mapper.route";
import { getTopicSubscriptionRoute } from "@be/audience/routes/audience-topic-mapper/routes/get-audience-topic-mapper.route";
import { listTopicSubscriptionsRoute } from "@be/audience/routes/audience-topic-mapper/routes/list-audience-topic-mappers.route";
import { unsubscribeContactRoute } from "@be/audience/routes/audience-topic-mapper/routes/unsubscribe-contact.route";
import { updateTopicSubscriptionRoute } from "@be/audience/routes/audience-topic-mapper/routes/update-audience-topic-mapper.route";
import { Elysia } from "elysia";

export const topicSubscriptionRoutes = new Elysia({
  prefix: "/v1/subscriptions",
  name: "TopicSubscriptionRoutes",
})
  .use(authMiddleware)
  .use(createTopicSubscriptionRoute)
  .use(getTopicSubscriptionRoute)
  .use(listTopicSubscriptionsRoute)
  .use(updateTopicSubscriptionRoute)
  .use(deleteTopicSubscriptionRoute)
  // Unsubscribe
  .use(unsubscribeContactRoute)
  // Bulk Add
  .use(bulkAddContactsToTopicRoute);
