import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { Elysia } from "elysia";
import { listTopicsController } from "./list-topics.controllers";
import { listTopicsXCodeSamples } from "./list-topics.x-codeSamples";

export const listTopicsRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, activeOrganizationId, logger }) => {
    return await listTopicsController({
      activeOrganizationId: activeOrganizationId as string,
      page: query.page,
      limit: query.limit,
      logger,
    });
  },
  {
    auth: true,
    query: TopicModel.topicQuery,
    response: {
      200: TopicModel.topicListResponse,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "List Topics",
      description: "Retrieves a paginated list of topics",
      "x-codeSamples": listTopicsXCodeSamples,
      responses: {
        200: {
          description: "Topics listed successfully",
          content: {
            "application/json": {
              example: {
                object: "topic",
                topics: [
                  {
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
                ],
                total: 1,
                page: 1,
                limit: 100,
              },
            },
          },
        },
      },
    },
  },
);
