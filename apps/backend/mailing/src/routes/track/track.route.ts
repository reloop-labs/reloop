
import { Elysia, t } from "elysia";
import { handleClickTracking, handleOpenTracking } from "./track.controllers";

export const trackRoute = new Elysia({
	prefix: "/track",
	name: "TrackRoute",
})
	.get(
		"/open/:emailLogId",
		({ params: { emailLogId } }) => handleOpenTracking({ emailLogId }),
		{
			params: t.Object({
				emailLogId: t.String(),
			}),
		},
	)
	.get(
		"/click/:emailLogId",
		({ params: { emailLogId }, query: { url } }) =>
			handleClickTracking({ emailLogId, url: url as string }),
		{
			params: t.Object({
				emailLogId: t.String(),
			}),
			query: t.Object({
				url: t.String(),
			}),
		},
	);
