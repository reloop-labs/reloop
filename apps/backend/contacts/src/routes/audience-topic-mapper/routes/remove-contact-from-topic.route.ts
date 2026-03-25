import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { removeContactFromTopicHandler } from "@be/contacts/routes/audience-topic-mapper/controllers/remove-contact-from-topic";
import { Elysia, t } from "elysia";

export const removeContactFromTopicRoute = new Elysia().use(authMiddleware).post(
  "/remove",
  async ({ body, activeOrganizationId }) => {
    return await removeContactFromTopicHandler(activeOrganizationId, body);
  },
  {
    auth: true,
    body: TopicEnrollmentModel.unenrollBody,
    response: {
      200: t.Object({ success: t.Boolean() }),
      404: TopicEnrollmentModel.notFound,
      403: TopicEnrollmentModel.unauthorized,
    },
    detail: {
      tags: ["Topic Enrollments"],
      summary: "Remove Contact From Topic",
      description: "Removes a contact from a topic by soft-deleting the enrollment",
    },
  },
);

