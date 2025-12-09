import { contactRoutes } from "@be/audience/routes/audience/audience.routes";
import { topicRoutes } from "@be/audience/routes/audience-topic/audience-topic.routes";
import { topicSubscriptionRoutes } from "@be/audience/routes/audience-topic-mapper/audience-topic-mapper.routes";
import { Elysia } from "elysia";

export const allRoutes = new Elysia()
	.use(contactRoutes)
	.use(topicRoutes)
	.use(topicSubscriptionRoutes);
