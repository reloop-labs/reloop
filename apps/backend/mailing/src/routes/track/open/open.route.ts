import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import { handleOpenTracking } from "./open.controllers";

export const openRoute = new Elysia()
	.use(evlog())
	.get(
		"/open/:emailLogId",
		({ params: { emailLogId }, query: { sig } }) =>
			handleOpenTracking({ emailLogId, sig: sig as string }),
		{
			params: t.Object({
				emailLogId: t.String(),
			}),
			query: t.Object({
				sig: t.String(),
			}),
			detail: {
				summary: "Track Email Open",
				description: "Serves a transparent pixel to track when an email is opened",
				tags: ["Tracking"],
			},
		},
	);
