import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { dkimKeyRoute } from "./dkim-key/dkim-key.route";
import { logIncomingRoute } from "./log-incoming/log-incoming.route";
import { verifyRoute } from "./verify/verify.route";
import { kumomtaWebhookRoute } from "./webhook/webhook.route";

export const kumomtaRoutes = new Elysia({
  prefix: "/v1",
  name: "KumomtaRoutes",
})
  .use(authMiddleware)
  .guard({ kumomtaAuth: true }, (app) =>
    app
      .use(verifyRoute)
      .use(kumomtaWebhookRoute)
      .use(logIncomingRoute)
      .use(dkimKeyRoute),
  );
