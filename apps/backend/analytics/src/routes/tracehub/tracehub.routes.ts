import { trackRoute } from "./routes/track.route";
import { Elysia } from "elysia";

export const tracehubRoutes = new Elysia({
	prefix: "/v1",
	name: "tracehubRoutes",
})
	.use(trackRoute);

