import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { Elysia, t } from "elysia";
import { getTopicController } from "./get-topic.controllers";
import { getTopicXCodeSamples } from "./get-topic.x-codeSamples";

export const getTopicRoute = new Elysia().use(authMiddleware).get(
  "/:topic_id",
  async ({ params, activeOrganizationId, logger }) => {
    return await getTopicController({
      activeOrganizationId,
      topic_id: params.topic_id,
      logger,
    });
  },
  {
    auth: true,
    params: t.Object({ topic_id: t.String({ description: "Topic ID" }) }),
    response: {
      200: TopicModel.topicResponse,
      404: TopicModel.topicNotFound,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "Retrieve Topic",
      description: "Retrieves a specific topic by ID",
      "x-codeSamples": getTopicXCodeSamples,
    },
  },
);
