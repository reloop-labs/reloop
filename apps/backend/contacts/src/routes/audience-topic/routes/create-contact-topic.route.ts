import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { createTopicHandler } from "@be/contacts/routes/audience-topic/controllers/create-contact-topic";
import { Elysia } from "elysia";

export const createTopicRoute = new Elysia().use(authMiddleware).post(
  "/add",
  async ({ body, user }) => {
    const { activeOrganizationId: organizationId, id: userId } = user;
    const { name, description, autoEnroll, visibility } = body;
    return await createTopicHandler({
      organizationId,
      userId,
      name,
      description,
      autoEnroll,
      visibility,
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
      summary: "Create a new topic",
      description: "Creates a new topic for the organization",
    },
  },
);
