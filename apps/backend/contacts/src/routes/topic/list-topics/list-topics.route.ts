import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { Elysia } from "elysia";
import { listTopicsController } from "./list-topics.controllers";
import { listTopicsXCodeSamples } from "./list-topics.x-codeSamples";

export const listTopicsRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, activeOrganizationId, logger }) => {
    return await listTopicsController({
      activeOrganizationId,
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
    },
  },
);
