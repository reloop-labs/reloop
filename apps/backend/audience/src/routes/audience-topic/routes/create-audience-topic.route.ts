import { authMiddleware } from "@be/audience/middleware/auth";
import { AudienceTopicModel } from "@be/audience/model/audience-topic.model";

import { createAudienceTopicHandler } from "@be/audience/routes/audience-topic/controllers/create-audience-topic";
import { Elysia } from "elysia";

export const createAudienceTopicRoute = new Elysia().use(authMiddleware).post(
  "/add",
  async ({ body, user }) => {
    const { activeOrganizationId: organizationId } = user;
    const { name, description } = body;
    return await createAudienceTopicHandler({
      organizationId,
      name,
      description,
    });
  },
  {
    auth: true,
    body: AudienceTopicModel.createAudienceTopicBody,
    response: {
      201: AudienceTopicModel.audienceTopicResponse,
      409: AudienceTopicModel.audienceTopicAlreadyExists,
      403: AudienceTopicModel.unauthorized,
    },
    detail: {
      tags: ["Audience Topics"],
      summary: "Create a new audience topic",
      description: "Creates a new audience topic for the organization",
    },
  },
);
