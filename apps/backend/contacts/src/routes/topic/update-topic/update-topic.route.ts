import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { Elysia, t } from "elysia";
import { updateTopicController } from "./update-topic.controllers";
import { updateTopicXCodeSamples } from "./update-topic.x-codeSamples";

export const updateTopicRoute = new Elysia().use(authMiddleware).patch(
  "/:topic_id",
  async ({ params, body, activeOrganizationId, logger }) => {
    const { name, description, visibility } = body;
    return await updateTopicController({
      activeOrganizationId,
      topic_id: params.topic_id,
      name,
      description: description ?? undefined,
      visibility,
      logger,
    });
  },
  {
    auth: true,
    params: t.Object({ topic_id: t.String({ description: "Topic ID" }) }),
    body: TopicModel.updateTopicBody,
    response: {
      200: TopicModel.topicResponse,
      404: TopicModel.topicNotFound,
      409: TopicModel.topicAlreadyExists,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "Update Topic",
      description: "Updates an existing topic",
      "x-codeSamples": updateTopicXCodeSamples,
    },
  },
);
