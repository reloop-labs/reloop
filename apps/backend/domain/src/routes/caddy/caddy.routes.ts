import { Elysia } from "elysia";
import { caddyAskRoute } from "./ask/ask.route";

export const caddyRoutes = new Elysia({
	prefix: "",
	name: "CaddyRoutes",
}).use(caddyAskRoute);
