import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceTopicModel } from "@be/audience/model/audience-topic.model";

import { deleteAudienceTopicHandler } from "@be/audience/routes/audience-topic/controllers/delete-audience-topic";
import { Elysia, t } from "elysia";

export const deleteAudienceTopicRoute = new Elysia().use(authMiddleware).delete(
  "/:topicId",
  async ({ params, user }) => {
    const { topicId } = params;
    return await deleteAudienceTopicHandler(topicId, user.activeOrganizationId);
  },
  {
    auth: true,
    params: t.Object({
      topicId: t.String({ description: "Audience topic ID" }),
    }),
    response: {
      200: AudienceTopicModel.deleteResponse,
      404: AudienceTopicModel.audienceTopicNotFound,
      403: AudienceTopicModel.unauthorized,
    },
    detail: {
      tags: ["Audience Topics"],
      summary: "Delete an audience topic",
      description: "Soft deletes an audience topic",
    },
  },
);
