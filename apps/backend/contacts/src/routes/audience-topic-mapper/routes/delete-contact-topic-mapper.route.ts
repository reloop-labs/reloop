import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { deleteTopicSubscriptionHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/delete-contact-topic-mapper";
import { Elysia, t } from "elysia";

export const deleteTopicEnrollmentRoute = new Elysia().use(authMiddleware).delete(
  "/:enrollmentId",
  async ({ params, activeOrganizationId }) => {
    const { enrollmentId } = params;
    return await deleteTopicSubscriptionHandler(enrollmentId, activeOrganizationId);
  },
  {
    auth: true,
    params: t.Object({
      enrollmentId: t.String({ description: "Enrollment ID" }),
    }),
    response: {
      200: TopicEnrollmentModel.deleteResponse,
      404: TopicEnrollmentModel.notFound,
      403: TopicEnrollmentModel.unauthorized,
    },
    detail: {
      tags: ["Topic Enrollments"],
      summary: "Delete a topic enrollment",
      description: "Soft deletes a topic enrollment",
    },
  },
);

