import { authMiddleware } from "@be/contacts/middleware/auth";
import { createTopicRoute } from "@be/contacts/routes/topic/create-topic/create-topic.route";
import { deleteTopicRoute } from "@be/contacts/routes/topic/delete-topic/delete-topic.route";
import { getTopicRoute } from "@be/contacts/routes/topic/get-topic/get-topic.route";
import { listTopicsRoute } from "@be/contacts/routes/topic/list-topics/list-topics.route";
import { updateTopicRoute } from "@be/contacts/routes/topic/update-topic/update-topic.route";
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
