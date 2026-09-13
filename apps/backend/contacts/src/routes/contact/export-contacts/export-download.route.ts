import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { Elysia, t } from "elysia";
import { exportDownloadController } from "./export-download.controllers";

export const exportDownloadRoute = new Elysia()
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "export-contacts-download",
		}),
	)
	.get(
		"/export/download",
		async ({ query, status }) => {
			if (!query.token) {
				return status(400, {
					message: "Missing download token",
					why: "The download link must include a token query parameter.",
					fix: "Use the full link from the export email, or request a fresh export.",
				});
			}
			return await exportDownloadController({ token: query.token });
		},
		{
			// Public: the HMAC token (exportId + org + 7-day expiry) is the
			// credential, so the link works from an email client with no session.
			rateLimit: true,
			query: t.Object({
				token: t.Optional(t.String({ description: "Signed download token" })),
			}),
			detail: {
				tags: ["Contact"],
				summary: "Download Emailed Export",
				description:
					"Downloads a previously emailed contacts CSV via its signed 7-day token. No session required.",
			},
		},
	);
