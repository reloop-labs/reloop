import { apiKeyRoutes } from "@reloop/api-key/routes/api-key/api-key.routes";
import { Elysia } from "elysia";
import { parseError } from "evlog";

export function createApp() {
	return new Elysia()
		.onError(({ error, set }) => {
			const parsed = parseError(error);
			set.status = parsed.status;
			let message = parsed.message;
			if (typeof message === "string" && message.trim().startsWith("{")) {
				try {
					const json = JSON.parse(message);
					if (json.summary) {
						message = json.summary;
					} else if (
						json.errors &&
						Array.isArray(json.errors) &&
						json.errors[0]?.summary
					) {
						message = json.errors[0].summary;
					} else if (
						json.message &&
						typeof json.message === "string" &&
						!json.message.startsWith("{")
					) {
						message = json.message;
					}
				} catch {
					// Keep original message if not JSON
				}
			}
			return {
				message,
				why: parsed.why,
				fix: parsed.fix,
			};
		})
		.use(apiKeyRoutes);
}

export type App = ReturnType<typeof createApp>;
