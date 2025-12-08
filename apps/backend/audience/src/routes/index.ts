import { audienceRoutes } from "@be/audience/routes/audience/audience.routes";
import { audienceTopicRoutes } from "@be/audience/routes/audience-topic/audience-topic.routes";
import { audienceTopicMapperRoutes } from "@be/audience/routes/audience-topic-mapper/audience-topic-mapper.routes";
import { Elysia } from "elysia";

export const allAudienceRoutes = new Elysia()
	.use(audienceRoutes)
	.use(audienceTopicRoutes)
	.use(audienceTopicMapperRoutes);
