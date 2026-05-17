import { parseError } from "evlog";
import { Elysia } from "elysia";
import { apiKeyRoutes } from "@reloop/api-key/routes/api-key/api-key.routes";

export function createApp() {
	return new Elysia()
		.onError(({ error, set }) => {
			const parsed = parseError(error);
			set.status = parsed.status;
			return {
				message: parsed.message,
				why: parsed.why,
				fix: parsed.fix,
			};
		})
		.use(apiKeyRoutes);
}

export type App = ReturnType<typeof createApp>;
