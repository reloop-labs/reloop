import { authMiddleware } from "@be/contacts/middleware/auth";
import { bulkAddContactsToTopicRoute } from "@be/contacts/routes/audience-topic-mapper/routes/bulk-add-contacts-to-topic.route";
import { createTopicSubscriptionRoute } from "@be/contacts/routes/audience-topic-mapper/routes/create-contact-topic-mapper.route";
import { deleteTopicSubscriptionRoute } from "@be/contacts/routes/audience-topic-mapper/routes/delete-contact-topic-mapper.route";
import { getTopicSubscriptionRoute } from "@be/contacts/routes/audience-topic-mapper/routes/get-contact-topic-mapper.route";
import { listTopicSubscriptionsRoute } from "@be/contacts/routes/audience-topic-mapper/routes/list-contact-topic-mappers.route";
import { removeContactFromTopicRoute } from "@be/contacts/routes/audience-topic-mapper/routes/remove-contact-from-topic.route";
import { subscribeContactRoute } from "@be/contacts/routes/audience-topic-mapper/routes/subscribe-contact.route";
import { unsubscribeContactRoute } from "@be/contacts/routes/audience-topic-mapper/routes/unsubscribe-contact.route";
import { updateTopicSubscriptionRoute } from "@be/contacts/routes/audience-topic-mapper/routes/update-contact-topic-mapper.route";
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
  // Subscribe/Unsubscribe/Remove
  .use(subscribeContactRoute)
  .use(unsubscribeContactRoute)
  .use(removeContactFromTopicRoute)
  // Bulk Add
  .use(bulkAddContactsToTopicRoute);
