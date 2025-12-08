import { authMiddleware } from "@be/audience/middleware/auth";
import { TopicModel } from "@be/audience/model/topic.model";
import { getTopicHandler } from "@be/audience/routes/audience-topic/controllers/get-audience-topic";
import { Elysia, t } from "elysia";

export const getTopicRoute = new Elysia().use(authMiddleware).get(
  "/:topicId",
  async ({ params, user }) => {
    const { topicId } = params;
    return await getTopicHandler(topicId, user.activeOrganizationId);
  },
  {
    auth: true,
    params: t.Object({
      topicId: t.String({ description: "Topic ID" }),
    }),
    response: {
      200: TopicModel.topicResponse,
      404: TopicModel.topicNotFound,
      403: TopicModel.unauthorized,
    },
    detail: {
      tags: ["Topics"],
      summary: "Get a topic",
      description: "Retrieves a specific topic by ID",
    },
  },
);
