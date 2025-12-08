import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceTopicModel } from "@be/audience/model/audience-topic.model";
import { updateAudienceTopicHandler } from "@be/audience/routes/audience-topic/controllers/update-audience-topic";
import { Elysia, t } from "elysia";

export const updateAudienceTopicRoute = new Elysia().use(authMiddleware).patch(
  "/:topicId",
  async ({ params, body, user }) => {
    const { topicId } = params;
    const { name, description } = body;
    return await updateAudienceTopicHandler({
      topicId,
      organizationId: user.activeOrganizationId,
      name,
      description,
    });
  },
  {
    auth: true,
    params: t.Object({
      topicId: t.String({ description: "Audience topic ID" }),
    }),
    body: AudienceTopicModel.updateAudienceTopicBody,
    response: {
      200: AudienceTopicModel.audienceTopicResponse,
      404: AudienceTopicModel.audienceTopicNotFound,
      409: AudienceTopicModel.audienceTopicAlreadyExists,
      403: AudienceTopicModel.unauthorized,
    },
    detail: {
      tags: ["Audience Topics"],
      summary: "Update an audience topic",
      description: "Updates an existing audience topic",
    },
  },
);
