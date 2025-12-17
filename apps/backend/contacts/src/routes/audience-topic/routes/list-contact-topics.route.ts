import { authMiddleware } from "@be/contacts/middleware/auth";
import { TopicModel } from "@be/contacts/model/topic.model";
import { listTopicsHandler } from "@be/contacts/routes/audience-topic/controllers/list-contact-topics";
import { Elysia } from "elysia";

export const listTopicsRoute = new Elysia().use(authMiddleware).get(
  "/list",
  async ({ query, user }) => {
    return await listTopicsHandler(query, user.activeOrganizationId);
  },
  {
    auth: true,
    query: TopicModel.topicQuery,
    response: {
      200: TopicModel.topicListResponse,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "List topics",
      description: "Retrieves a paginated list of topics",
    },
  },
);
