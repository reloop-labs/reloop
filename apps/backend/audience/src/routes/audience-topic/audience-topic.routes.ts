import { authMiddleware } from "@be/audience/middleware/auth";
import { createTopicRoute } from "@be/audience/routes/audience-topic/routes/create-audience-topic.route";
import { deleteTopicRoute } from "@be/audience/routes/audience-topic/routes/delete-audience-topic.route";
import { getTopicRoute } from "@be/audience/routes/audience-topic/routes/get-audience-topic.route";
import { listTopicsRoute } from "@be/audience/routes/audience-topic/routes/list-audience-topics.route";
import { updateTopicRoute } from "@be/audience/routes/audience-topic/routes/update-audience-topic.route";
import { Elysia } from "elysia";

export const topicRoutes = new Elysia({
  prefix: "/v1/topics",
  name: "TopicRoutes",
})
  .use(authMiddleware)
  .use(createTopicRoute)
  .use(getTopicRoute)
  .use(listTopicsRoute)
  .use(updateTopicRoute)
  .use(deleteTopicRoute);
