import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import { handleOpenTracking } from "./open.controllers";

export const openRoute = new Elysia()
	.use(evlog())
	.get(
		"/open/:token",
		({ params: { token } }) => handleOpenTracking({ token }),
		{
			params: t.Object({
				token: t.String(),
			}),
			detail: {
				summary: "Track Email Open",
				description:
					"Serves a transparent pixel to track when an email is opened",
				tags: ["Tracking"],
				hide: true,
			},
		},
	);
