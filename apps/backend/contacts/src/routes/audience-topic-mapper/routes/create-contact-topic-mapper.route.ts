import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { createTopicSubscriptionHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/create-contact-topic-mapper";
import { Elysia } from "elysia";

export const createTopicEnrollmentRoute = new Elysia().use(authMiddleware).post(
  "/add",
  async ({ body, activeOrganizationId }) => {
    const { contactId, topicId, status } = body;
    return await createTopicSubscriptionHandler({
      organizationId: activeOrganizationId,
      contactId,
      topicId,
      subscriptionStatus: status,
    });
  },
  {
    auth: true,
    body: TopicEnrollmentModel.createTopicEnrollmentBody,
    response: {
      201: TopicEnrollmentModel.topicEnrollmentResponse,
      409: TopicEnrollmentModel.enrollmentAlreadyExists,
      404: TopicEnrollmentModel.notFound,
      403: TopicEnrollmentModel.unauthorized,
    },
    detail: {
      tags: ["Topic Enrollments"],
      summary: "Enroll Contact In A Topic",
      description: "Creates an enrollment between a contact and a topic",
    },
  },
);

