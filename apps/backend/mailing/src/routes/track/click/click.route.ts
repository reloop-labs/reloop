import { Elysia, t } from "elysia";
import { parseError } from "evlog";
import { evlog } from "evlog/elysia";
import { handleClickTracking } from "./click.controllers";

export const clickRoute = new Elysia()
	.use(evlog())
	.onError(({ error, set }) => {
		const parsed = parseError(error);
		set.status = parsed.status;
		return {
			message: parsed.message,
			why: parsed.why,
			fix: parsed.fix,
			link: parsed.link,
		};
	})
	.get(
		"/click/:emailLogId",
		({ params: { emailLogId }, query: { url, sig } }) =>
			handleClickTracking({ emailLogId, url, sig }),
		{
			params: t.Object({ emailLogId: t.String() }),
			query: t.Object({
				url: t.String({ format: "uri" }),
				sig: t.String(),
			}),
			detail: {
				summary: "Track Email Click",
				description:
					"Tracks when a recipient clicks a link in an email and redirects them to the destination",
				tags: ["Tracking"],
			},
		},
	);
