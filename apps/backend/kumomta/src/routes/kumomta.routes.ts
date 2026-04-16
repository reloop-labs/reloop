import { Elysia } from "elysia";
import { kumomtaConfigRoute } from "./config/config.route";
import { kumomtaWebhookRoute } from "./webhook/webhook.route";

export const kumomtaRoutes = new Elysia({
  prefix: "/v1",
  name: "KumomtaRoutes",
})
  .use(kumomtaConfigRoute)
  .use(kumomtaWebhookRoute);
