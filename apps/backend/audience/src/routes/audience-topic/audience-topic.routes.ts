import { authMiddleware } from "@be/audience/middleware/auth";
import { createAudienceTopicRoute } from "@be/audience/routes/audience-topic/routes/create-audience-topic.route";
import { deleteAudienceTopicRoute } from "@be/audience/routes/audience-topic/routes/delete-audience-topic.route";
import { getAudienceTopicRoute } from "@be/audience/routes/audience-topic/routes/get-audience-topic.route";
import { listAudienceTopicsRoute } from "@be/audience/routes/audience-topic/routes/list-audience-topics.route";
import { updateAudienceTopicRoute } from "@be/audience/routes/audience-topic/routes/update-audience-topic.route";
import { Elysia } from "elysia";

export const audienceTopicRoutes = new Elysia({
  prefix: "/v1/topics",
  name: "AudienceTopicRoutes",
})
  .use(authMiddleware)
  .use(createAudienceTopicRoute)
  .use(getAudienceTopicRoute)
  .use(listAudienceTopicsRoute)
  .use(updateAudienceTopicRoute)
  .use(deleteAudienceTopicRoute);
