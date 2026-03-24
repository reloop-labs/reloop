import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { deleteTopicHandler } from "@be/contacts/routes/topic/controllers/delete-topic";
import { Elysia, t } from "elysia";

export const deleteTopicRoute = new Elysia().use(authMiddleware).delete(
  "/:topic_id",
  async ({ params, activeOrganizationId, logger }) => {
    return await deleteTopicHandler(params.topic_id, activeOrganizationId as string, logger);
  },
  {
    auth: true,
    params: t.Object({
      topic_id: t.String({ description: "Topic ID" }),
    }),
    response: {
      200: TopicModel.deleteResponse,
      404: TopicModel.topicNotFound,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "Delete topic",
      description: "Soft deletes a topic",
      responses: {
        200: {
          description: "Topic deleted successfully",
          content: {
            "application/json": {
              example: {
                success: true,
              },
            },
          },
        },
      },
    },
  },
);
