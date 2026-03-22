import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { getTopicSubscriptionHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/get-contact-topic-mapper";
import { Elysia, t } from "elysia";

export const getTopicEnrollmentRoute = new Elysia().use(authMiddleware).get(
  "/:enrollmentId",
  async ({ params, activeOrganizationId }) => {
    const { enrollmentId } = params;
    return await getTopicSubscriptionHandler(enrollmentId, activeOrganizationId);
  },
  {
    auth: true,
    params: t.Object({
      enrollmentId: t.String({ description: "Enrollment ID" }),
    }),
    response: {
      200: TopicEnrollmentModel.topicEnrollmentResponse,
      404: TopicEnrollmentModel.notFound,
      403: TopicEnrollmentModel.unauthorized,
    },
    detail: {
      tags: ["Topic Enrollments"],
      summary: "Get a topic enrollment",
      description: "Retrieves a specific topic enrollment by ID",
    },
  },
);

