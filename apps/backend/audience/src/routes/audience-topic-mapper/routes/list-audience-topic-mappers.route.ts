import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceTopicMapperModel } from "@be/audience/model/audience-topic-mapper.model";

import { listAudienceTopicMappersHandler } from "@be/audience/routes/audience-topic-mapper/controllers/list-audience-topic-mappers";
import { Elysia } from "elysia";

export const listAudienceTopicMappersRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, user }) => {
    return await listAudienceTopicMappersHandler(query, user.activeOrganizationId);
  },
  {
    auth: true,
    query: AudienceTopicMapperModel.audienceTopicMapperQuery,
    response: {
      200: AudienceTopicMapperModel.audienceTopicMapperListResponse,
      403: AudienceTopicMapperModel.unauthorized,
    },
    detail: {
      tags: ["Audience Subscriptions"],
      summary: "List subscription mappings",
      description: "Retrieves a paginated list of audience-topic subscriptions with optional filters",
    },
  },
);
