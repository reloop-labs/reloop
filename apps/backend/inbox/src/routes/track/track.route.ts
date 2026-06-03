import { Elysia } from "elysia";
import { clickRoute } from "./click/click.route";
import { openRoute } from "./open/open.route";

export const trackRoute = new Elysia({
	prefix: "/track",
	name: "TrackRoute",
})
	.use(openRoute)
	.use(clickRoute);
