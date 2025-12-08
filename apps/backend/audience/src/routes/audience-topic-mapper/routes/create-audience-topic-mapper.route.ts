import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceTopicMapperModel } from "@be/audience/model/audience-topic-mapper.model";

import { createAudienceTopicMapperHandler } from "@be/audience/routes/audience-topic-mapper/controllers/create-audience-topic-mapper";
import { Elysia } from "elysia";

export const createAudienceTopicMapperRoute = new Elysia().use(authMiddleware).post(
  "/add",
  async ({ body, user }) => {
    const { activeOrganizationId: organizationId } = user;
    const { audienceId, audienceTopicId, status } = body;
    return await createAudienceTopicMapperHandler({
      organizationId,
      audienceId,
      audienceTopicId,
      subscriptionStatus: status,
    });
  },
  {
    auth: true,
    body: AudienceTopicMapperModel.createAudienceTopicMapperBody,
    response: {
      201: AudienceTopicMapperModel.audienceTopicMapperResponse,
      409: AudienceTopicMapperModel.mappingAlreadyExists,
      404: AudienceTopicMapperModel.notFound,
      403: AudienceTopicMapperModel.unauthorized,
    },
    detail: {
      tags: ["Audience Subscriptions"],
      summary: "Subscribe audience to a topic",
      description: "Creates a subscription mapping between an audience and a topic",
    },
  },
);
