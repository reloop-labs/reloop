import { Elysia } from "elysia";
import { dkimKeyRoute } from "./dkim-key/dkim-key.route";
import { logIncomingRoute } from "./log-incoming/log-incoming.route";
import { verifyRoute } from "./verify/verify.route";

export const kumomtaRoutes = new Elysia({ prefix: "", name: "KumomtaRoutes" })
	.use(verifyRoute)
	.use(dkimKeyRoute)
	.use(logIncomingRoute);
