import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { Elysia } from "elysia";
import { createTopicController } from "./create-topic.controllers";
import { createTopicXCodeSamples } from "./create-topic.x-codeSamples";

export const createTopicRoute = new Elysia().use(authMiddleware).post(
  "/create",
  async ({ body, activeOrganizationId, userId, logger, path, request, headers }) => {
    const { name, description, defaultSubscription, visibility } = body;
    const cookieString = headers["cookie"] || "";
    return await createTopicController({
      activeOrganizationId,
      userId,
      name,
      description,
      defaultSubscription,
      visibility,
      logger,
      cookie: cookieString,
      requestDetails: {
        endpoint: path,
        method: request.method,
        userAgent: headers["user-agent"],
        ipAddress: (headers["x-forwarded-for"] as string) || (headers["x-real-ip"] as string),
      },
    });
  },
  {
    auth: true,
    body: TopicModel.createTopicBody,
    response: {
      201: TopicModel.topicResponse,
      409: TopicModel.topicAlreadyExists,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "Create Topic",
      description: "Creates a new topic for the organization",
      "x-codeSamples": createTopicXCodeSamples,
    },
  },
);
