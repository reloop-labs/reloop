import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { Elysia, t } from "elysia";
import { deleteTopicController } from "./delete-topic.controllers";
import { deleteTopicXCodeSamples } from "./delete-topic.x-codeSamples";

export const deleteTopicRoute = new Elysia().use(authMiddleware).delete(
  "/:topic_id",
  async ({ params, activeOrganizationId, logger }) => {
    return await deleteTopicController({
      activeOrganizationId: activeOrganizationId as string,
      topic_id: params.topic_id,
      logger,
    });
  },
  {
    auth: true,
    params: t.Object({ topic_id: t.String({ description: "Topic ID" }) }),
    response: {
      200: TopicModel.deleteResponse,
      404: TopicModel.topicNotFound,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "Delete Topic",
      description: "Soft deletes a topic",
      "x-codeSamples": deleteTopicXCodeSamples,
      responses: {
        200: {
          description: "Topic deleted successfully",
          content: {
            "application/json": {
              example: { success: true },
            },
          },
        },
      },
    },
  },
);
