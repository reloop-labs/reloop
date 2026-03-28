import { getTopicSamples } from "@be/contacts/code-samples/topic/get-topic";
import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { Elysia, t } from "elysia";
import { getTopicController } from "./get-topic.controllers";

export const getTopicRoute = new Elysia().use(authMiddleware).get(
  "/:topic_id",
  async ({ params, activeOrganizationId, logger }) => {
    return await getTopicController({
      activeOrganizationId: activeOrganizationId as string,
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
      "x-codeSamples": getTopicSamples,
      responses: {
        200: {
          description: "Topic retrieved successfully",
          content: {
            "application/json": {
              example: {
                object: "topic",
                id: "topic_123456789",
                name: "Newsletter",
                description: "Monthly newsletter subscribers",
                defaultSubscription: "opt_in",
                visibility: "public",
                organizationId: "org_123456789",
                createdAt: "2026-03-24T10:00:00Z",
                updatedAt: "2026-03-24T10:00:00Z",
                deletedAt: null,
              },
            },
          },
        },
      },
    },
  },
);
