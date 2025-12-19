import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { subscribeContactHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/subscribe-contact";
import { Elysia } from "elysia";

export const subscribeContactRoute = new Elysia().use(authMiddleware).post(
  "/subscribe",
  async ({ body, user }) => {
    const { activeOrganizationId } = user;
    return await subscribeContactHandler(activeOrganizationId, body);
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
      summary: "Enroll contact in topic",
      description: "Updates the enrollment status to enrolled for a contact-topic pair",
    },
  },
);

