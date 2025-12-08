import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceTopicModel } from "@be/audience/model/audience-topic.model";

import { listAudienceTopicsHandler } from "@be/audience/routes/audience-topic/controllers/list-audience-topics";
import { Elysia } from "elysia";

export const listAudienceTopicsRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, user }) => {
    return await listAudienceTopicsHandler(query, user.activeOrganizationId);
  },
  {
    auth: true,
    query: AudienceTopicModel.audienceTopicQuery,
    response: {
      200: AudienceTopicModel.audienceTopicListResponse,
      403: AudienceTopicModel.unauthorized,
    },
    detail: {
      tags: ["Audience Topics"],
      summary: "List audience topics",
      description: "Retrieves a paginated list of audience topics",
    },
  },
);
