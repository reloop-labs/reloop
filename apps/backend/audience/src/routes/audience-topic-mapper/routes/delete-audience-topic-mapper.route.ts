import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceTopicMapperModel } from "@be/audience/model/audience-topic-mapper.model";
import { deleteAudienceTopicMapperHandler } from "@be/audience/routes/audience-topic-mapper/controllers/delete-audience-topic-mapper";
import { Elysia, t } from "elysia";

export const deleteAudienceTopicMapperRoute = new Elysia().use(authMiddleware).delete(
  "/:mapperId",
  async ({ params, user }) => {
    const { mapperId } = params;
    return await deleteAudienceTopicMapperHandler(mapperId, user.activeOrganizationId);
  },
  {
    auth: true,
    params: t.Object({
      mapperId: t.String({ description: "Audience topic mapper ID" }),
    }),
    response: {
      200: AudienceTopicMapperModel.deleteResponse,
      404: AudienceTopicMapperModel.notFound,
      403: AudienceTopicMapperModel.unauthorized,
    },
    detail: {
      tags: ["Audience Subscriptions"],
      summary: "Remove subscription",
      description: "Removes an audience-topic subscription",
    },
  },
);
