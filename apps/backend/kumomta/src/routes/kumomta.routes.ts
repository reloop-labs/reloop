import { Elysia } from "elysia";
import { verifyApiKeyRoute } from "./auth/verify-api-key/verify-api-key.route";
import { kumomtaConfigRoute } from "./config/config.route";
import { kumomtaWebhookRoute } from "./webhook/webhook.route";

export const kumomtaRoutes = new Elysia({
  prefix: "/v1",
  name: "KumomtaRoutes",
})
  .use(verifyApiKeyRoute)
  .use(kumomtaConfigRoute)
  .use(kumomtaWebhookRoute);
