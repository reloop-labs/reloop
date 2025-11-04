import { Elysia } from "elysia";
import { trackRoute } from "./routes/track.route";

export const tracehubRoutes = new Elysia({
	prefix: "/v1",
	name: "tracehubRoutes",
}).use(trackRoute);
