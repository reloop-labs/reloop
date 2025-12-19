import { authMiddleware } from "@be/contacts/middleware/auth";
import { bulkAddContactsToTopicRoute } from "@be/contacts/routes/audience-topic-mapper/routes/bulk-add-contacts-to-topic.route";
import { createTopicEnrollmentRoute } from "@be/contacts/routes/audience-topic-mapper/routes/create-contact-topic-mapper.route";
import { deleteTopicEnrollmentRoute } from "@be/contacts/routes/audience-topic-mapper/routes/delete-contact-topic-mapper.route";
import { getTopicEnrollmentRoute } from "@be/contacts/routes/audience-topic-mapper/routes/get-contact-topic-mapper.route";
import { listTopicEnrollmentsRoute } from "@be/contacts/routes/audience-topic-mapper/routes/list-contact-topic-mappers.route";
import { removeContactFromTopicRoute } from "@be/contacts/routes/audience-topic-mapper/routes/remove-contact-from-topic.route";
import { subscribeContactRoute } from "@be/contacts/routes/audience-topic-mapper/routes/subscribe-contact.route";
import { unsubscribeContactRoute } from "@be/contacts/routes/audience-topic-mapper/routes/unsubscribe-contact.route";
import { updateTopicEnrollmentRoute } from "@be/contacts/routes/audience-topic-mapper/routes/update-contact-topic-mapper.route";
import { Elysia } from "elysia";

export const topicEnrollmentRoutes = new Elysia({
  prefix: "/v1/enrollments",
  name: "TopicEnrollmentRoutes",
})
  .use(authMiddleware)
  .use(createTopicEnrollmentRoute)
  .use(getTopicEnrollmentRoute)
  .use(listTopicEnrollmentsRoute)
  .use(updateTopicEnrollmentRoute)
  .use(deleteTopicEnrollmentRoute)
  // Enroll/Unenroll/Remove
  .use(subscribeContactRoute)
  .use(unsubscribeContactRoute)
  .use(removeContactFromTopicRoute)
  // Bulk Add
  .use(bulkAddContactsToTopicRoute);

// Backward compatibility alias
export const topicSubscriptionRoutes = topicEnrollmentRoutes;

