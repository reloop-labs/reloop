import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { updateTopicHandler } from "@be/contacts/routes/audience-topic/controllers/update-contact-topic";
import { Elysia, t } from "elysia";

export const updateTopicRoute = new Elysia().use(authMiddleware).patch(
  "/:topicId",
  async ({ params, body, user }) => {
    const { topicId } = params;
    const { name, description } = body;
    return await updateTopicHandler({
      topicId,
      organizationId: user.activeOrganizationId,
      name,
      description,
    });
  },
  {
    auth: true,
    params: t.Object({
      topicId: t.String({ description: "Topic ID" }),
    }),
    body: TopicModel.updateTopicBody,
    response: {
      200: TopicModel.topicResponse,
      404: TopicModel.topicNotFound,
      409: TopicModel.topicAlreadyExists,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "Update a topic",
      description: "Updates an existing topic",
    },
  },
);
