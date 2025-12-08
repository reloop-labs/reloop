import { authMiddleware } from "@be/audience/middleware/auth";
import { TopicModel } from "@be/audience/model/topic.model";
import { deleteTopicHandler } from "@be/audience/routes/audience-topic/controllers/delete-audience-topic";
import { Elysia, t } from "elysia";

export const deleteTopicRoute = new Elysia().use(authMiddleware).delete(
  "/:topicId",
  async ({ params, user }) => {
    const { topicId } = params;
    return await deleteTopicHandler(topicId, user.activeOrganizationId);
  },
  {
    auth: true,
    params: t.Object({
      topicId: t.String({ description: "Topic ID" }),
    }),
    response: {
      200: TopicModel.deleteResponse,
      404: TopicModel.topicNotFound,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "Delete a topic",
      description: "Soft deletes a topic",
    },
  },
);
