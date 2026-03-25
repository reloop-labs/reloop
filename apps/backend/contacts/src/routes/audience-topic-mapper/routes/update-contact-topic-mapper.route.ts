import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { updateTopicSubscriptionHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/update-contact-topic-mapper";
import { Elysia, t } from "elysia";

export const updateTopicEnrollmentRoute = new Elysia().use(authMiddleware).patch(
  "/:enrollmentId",
  async ({ params, body, activeOrganizationId }) => {
    const { enrollmentId } = params;
    const { status } = body;
    return await updateTopicSubscriptionHandler({
      subscriptionId: enrollmentId,
      organizationId: activeOrganizationId,
      subscriptionStatus: status,
    });
  },
  {
    auth: true,
    params: t.Object({
      enrollmentId: t.String({ description: "Enrollment ID" }),
    }),
    body: TopicEnrollmentModel.updateTopicEnrollmentBody,
    response: {
      200: TopicEnrollmentModel.topicEnrollmentResponse,
      404: TopicEnrollmentModel.notFound,
      403: TopicEnrollmentModel.unauthorized,
    },
    detail: {
      tags: ["Topic Enrollments"],
      summary: "Update A Topic Enrollment",
      description: "Updates the status of a topic enrollment",
    },
  },
);

