import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { kumomtaConfigRoute } from "./config/config.route";
import { verifyApiKeyRoute } from "./verify-api-key/verify-api-key.route";
import { verifyDomainRoute } from "./verify-domain/verify-domain.route";
import { kumomtaWebhookRoute } from "./webhook/webhook.route";

export const kumomtaRoutes = new Elysia({
  prefix: "/v1",
  name: "KumomtaRoutes",
})
  .use(authMiddleware)
  .guard({ kumomtaAuth: true }, (app) =>
    app.use(verifyApiKeyRoute).use(kumomtaConfigRoute).use(kumomtaWebhookRoute).use(verifyDomainRoute),
  );
