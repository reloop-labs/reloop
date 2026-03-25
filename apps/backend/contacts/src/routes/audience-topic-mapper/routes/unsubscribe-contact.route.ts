import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { unsubscribeContactHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/unsubscribe-contact";
import { Elysia } from "elysia";

export const unsubscribeContactRoute = new Elysia().use(authMiddleware).post(
  "/unsubscribe",
  async ({ body, activeOrganizationId }) => {
    return await unsubscribeContactHandler(activeOrganizationId, body);
  },
  {
    auth: true,
    body: TopicEnrollmentModel.unenrollBody,
    response: {
      200: TopicEnrollmentModel.topicEnrollmentResponse,
      404: TopicEnrollmentModel.notFound,
      403: TopicEnrollmentModel.unauthorized,
    },
    detail: {
      tags: ["Topic Enrollments"],
      summary: "Unenroll Contact From Topic",
      description: "Updates the enrollment status to unenrolled for a contact-topic pair",
    },
  },
);

