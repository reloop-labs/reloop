import { authMiddleware } from "@be/audience/middleware/auth";
import { createAudienceTopicMapperRoute } from "@be/audience/routes/audience-topic-mapper/routes/create-audience-topic-mapper.route";
import { deleteAudienceTopicMapperRoute } from "@be/audience/routes/audience-topic-mapper/routes/delete-audience-topic-mapper.route";
import { getAudienceTopicMapperRoute } from "@be/audience/routes/audience-topic-mapper/routes/get-audience-topic-mapper.route";
import { listAudienceTopicMappersRoute } from "@be/audience/routes/audience-topic-mapper/routes/list-audience-topic-mappers.route";
import { updateAudienceTopicMapperRoute } from "@be/audience/routes/audience-topic-mapper/routes/update-audience-topic-mapper.route";
import { Elysia } from "elysia";

export const audienceTopicMapperRoutes = new Elysia({
  prefix: "/v1/subscriptions",
  name: "AudienceTopicMapperRoutes",
})
  .use(authMiddleware)
  .use(createAudienceTopicMapperRoute)
  .use(getAudienceTopicMapperRoute)
  .use(listAudienceTopicMappersRoute)
  .use(updateAudienceTopicMapperRoute)
  .use(deleteAudienceTopicMapperRoute);
