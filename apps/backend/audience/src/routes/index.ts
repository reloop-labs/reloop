import { audienceRoutes } from "@reloop/audience/routes/audience/audience.routes";
import { audienceGroupRoutes } from "@reloop/audience/routes/audience-group/audience-group.routes";
import { Elysia } from "elysia";

export const allAudienceRoutes = new Elysia({
    prefix: "/audiences",
    name: "AllAudienceRoutes",
})
    .use(audienceRoutes)
    .use(audienceGroupRoutes);
