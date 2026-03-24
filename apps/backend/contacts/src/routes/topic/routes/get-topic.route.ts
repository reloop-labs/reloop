import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { getTopicHandler } from "@be/contacts/routes/topic/controllers/get-topic";
import { Elysia, t } from "elysia";

export const getTopicRoute = new Elysia().use(authMiddleware).get(
  "/:topic_id",
  async ({ params, activeOrganizationId, logger }) => {
    return await getTopicHandler(params.topic_id, activeOrganizationId as string, logger);
  },
  {
    auth: true,
    params: t.Object({
      topic_id: t.String({ description: "Topic ID" }),
    }),
    response: {
      200: TopicModel.topicResponse,
      404: TopicModel.topicNotFound,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "Retrieve topic",
      description: "Retrieves a specific topic by ID",
      responses: {
        200: {
          description: "Topic retrieved successfully",
          content: {
            "application/json": {
              example: {
                object: "contact_topic",
                id: "topic_123456789",
                name: "Newsletter",
                description: "Monthly newsletter subscribers",
                autoEnroll: "enrolled",
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
