import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceTopicMapperModel } from "@be/audience/model/audience-topic-mapper.model";
import { updateAudienceTopicMapperHandler } from "@be/audience/routes/audience-topic-mapper/controllers/update-audience-topic-mapper";
import { Elysia, t } from "elysia";

export const updateAudienceTopicMapperRoute = new Elysia().use(authMiddleware).patch(
  "/:mapperId",
  async ({ params, body, user }) => {
    const { mapperId } = params;
    const { status } = body;
    return await updateAudienceTopicMapperHandler({
      mapperId,
      organizationId: user.activeOrganizationId,
      subscriptionStatus: status,
    });
  },
  {
    auth: true,
    params: t.Object({
      mapperId: t.String({ description: "Audience topic mapper ID" }),
    }),
    body: AudienceTopicMapperModel.updateAudienceTopicMapperBody,
    response: {
      200: AudienceTopicMapperModel.audienceTopicMapperResponse,
      404: AudienceTopicMapperModel.notFound,
      403: AudienceTopicMapperModel.unauthorized,
    },
    detail: {
      tags: ["Audience Subscriptions"],
      summary: "Update subscription status",
      description: "Updates the subscription status (subscribe/unsubscribe)",
    },
  },
);
