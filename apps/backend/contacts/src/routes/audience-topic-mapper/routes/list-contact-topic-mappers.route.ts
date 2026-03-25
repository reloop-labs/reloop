import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { listTopicSubscriptionsHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/list-contact-topic-mappers";
import { Elysia } from "elysia";

export const listTopicEnrollmentsRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, activeOrganizationId }) => {
    return await listTopicSubscriptionsHandler(query, activeOrganizationId);
  },
  {
    auth: true,
    query: TopicEnrollmentModel.topicEnrollmentQuery,
    response: {
      200: TopicEnrollmentModel.topicEnrollmentListResponse,
      403: TopicEnrollmentModel.unauthorized,
    },
    detail: {
      tags: ["Topic Enrollments"],
      summary: "List Topic Enrollments",
      description: "Retrieves a paginated list of topic enrollments",
    },
  },
);

