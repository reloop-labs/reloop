import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { bulkAddContactsToTopicHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/bulk-add-contacts-to-topic";
import { Elysia } from "elysia";

export const bulkAddContactsToTopicRoute = new Elysia().use(authMiddleware).post(
  "/bulk-add",
  async ({ body, activeOrganizationId }) => {
    return await bulkAddContactsToTopicHandler(activeOrganizationId, body);
  },
  {
    auth: true,
    body: TopicEnrollmentModel.bulkEnrollContactsBody,
    response: {
      200: TopicEnrollmentModel.bulkEnrollResponse,
      404: TopicEnrollmentModel.notFound,
      400: TopicEnrollmentModel.validationError,
      403: TopicEnrollmentModel.unauthorized,
    },
    detail: {
      tags: ["Topic Enrollments"],
      summary: "Bulk Add Contacts To Topic",
      description: "Enroll multiple contacts in an existing topic at once",
    },
  },
);

