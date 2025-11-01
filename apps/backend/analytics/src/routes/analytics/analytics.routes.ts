import { trackRoute } from "./routes/track.route";
import { Elysia } from "elysia";

export const analyticsRoutes = new Elysia({
	prefix: "/v1",
	name: "AnalyticsRoutes",
})
	.use(trackRoute);

