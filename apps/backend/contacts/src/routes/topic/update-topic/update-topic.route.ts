import { updateTopicSamples } from "@be/contacts/code-samples/topic/update-topic";
import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { Elysia, t } from "elysia";
import { updateTopicController } from "./update-topic.controllers";

export const updateTopicRoute = new Elysia().use(authMiddleware).patch(
  "/:topic_id",
  async ({ params, body, activeOrganizationId, logger }) => {
    const { name, description, visibility } = body;
    return await updateTopicController({
      activeOrganizationId: activeOrganizationId as string,
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
      "x-codeSamples": updateTopicSamples,
      responses: {
        200: {
          description: "Topic updated successfully",
          content: {
            "application/json": {
              example: {
                object: "topic",
                id: "topic_123456789",
                name: "Updated Newsletter",
                description: "Monthly newsletter subscribers",
                defaultSubscription: "opt_in",
                visibility: "public",
                organizationId: "org_123456789",
                createdAt: "2026-03-24T10:00:00Z",
                updatedAt: "2026-03-24T11:00:00Z",
                deletedAt: null,
              },
            },
          },
        },
      },
    },
  },
);
