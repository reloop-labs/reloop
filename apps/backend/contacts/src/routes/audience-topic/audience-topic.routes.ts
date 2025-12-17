import { authMiddleware } from "@be/contacts/middleware/auth";
import { createTopicRoute } from "@be/contacts/routes/audience-topic/routes/create-contact-topic.route";
import { deleteTopicRoute } from "@be/contacts/routes/audience-topic/routes/delete-contact-topic.route";
import { getTopicRoute } from "@be/contacts/routes/audience-topic/routes/get-contact-topic.route";
import { listTopicsRoute } from "@be/contacts/routes/audience-topic/routes/list-contact-topics.route";
import { updateTopicRoute } from "@be/contacts/routes/audience-topic/routes/update-contact-topic.route";
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
