import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceTopicMapperModel } from "@be/audience/model/audience-topic-mapper.model";
import { getAudienceTopicMapperHandler } from "@be/audience/routes/audience-topic-mapper/controllers/get-audience-topic-mapper";
import { Elysia, t } from "elysia";

export const getAudienceTopicMapperRoute = new Elysia().use(authMiddleware).get(
  "/:mapperId",
  async ({ params, user }) => {
    const { mapperId } = params;
    return await getAudienceTopicMapperHandler(mapperId, user.activeOrganizationId);
  },
  {
    auth: true,
    params: t.Object({
      mapperId: t.String({ description: "Audience topic mapper ID" }),
    }),
    response: {
      200: AudienceTopicMapperModel.audienceTopicMapperResponse,
      404: AudienceTopicMapperModel.notFound,
      403: AudienceTopicMapperModel.unauthorized,
    },
    detail: {
      tags: ["Audience Subscriptions"],
      summary: "Get a subscription mapping",
      description: "Retrieves a specific audience-topic subscription by ID",
    },
  },
);
