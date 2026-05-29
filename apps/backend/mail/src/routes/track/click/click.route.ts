import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import { handleClickTracking } from "./click.controllers";

export const clickRoute = new Elysia()
	.use(evlog())
	.get(
		"/click/:token",
		({ params: { token } }) => handleClickTracking({ token }),
		{
			params: t.Object({ token: t.String() }),
			detail: {
				summary: "Track Email Click",
				description:
					"Tracks when a recipient clicks a link in an email and redirects them to the destination",
				tags: ["Tracking"],
			},
		},
	);
