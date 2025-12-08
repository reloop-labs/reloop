import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceTopicModel } from "@be/audience/model/audience-topic.model";
import { getAudienceTopicHandler } from "@be/audience/routes/audience-topic/controllers/get-audience-topic";
import { Elysia, t } from "elysia";

export const getAudienceTopicRoute = new Elysia().use(authMiddleware).get(
  "/:topicId",
  async ({ params, user }) => {
    const { topicId } = params;
    return await getAudienceTopicHandler(topicId, user.activeOrganizationId);
  },
  {
    auth: true,
    params: t.Object({
      topicId: t.String({ description: "Audience topic ID" }),
    }),
    response: {
      200: AudienceTopicModel.audienceTopicResponse,
      404: AudienceTopicModel.audienceTopicNotFound,
      403: AudienceTopicModel.unauthorized,
    },
    detail: {
      tags: ["Audience Topics"],
      summary: "Get an audience topic",
      description: "Retrieves a specific audience topic by ID",
    },
  },
);
