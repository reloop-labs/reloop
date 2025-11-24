import { audienceRoutes } from "@be/audience/routes/audience/audience.routes";
import { audienceGroupRoutes } from "@be/audience/routes/audience-group/audience-group.routes";
import { Elysia } from "elysia";

export const allAudienceRoutes = new Elysia()
	.use(audienceRoutes)
	.use(audienceGroupRoutes);
