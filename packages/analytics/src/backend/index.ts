import type { AnalyticsClientOptions } from "../client.js";
import { AnalyticsTracker } from "./tracker.js";
import type { Properties } from "./types.js";
import { PulseHTTPError } from "./types.js";

export interface AnalyticsConfig extends AnalyticsClientOptions {
	// Additional config options can be added here
}

export default function analytics(config?: AnalyticsConfig | string) {
	// If config is a string, treat it as an API URL (for backward compatibility)
	const apiConfig: AnalyticsClientOptions | undefined =
		typeof config === "string" ? { apiUrl: config } : config;

	const tracker = new AnalyticsTracker(apiConfig);

	const s = {
		async event(
			name: string,
			userId: string,
			properties: Properties = {},
			options?: {
				organizationId?: string | null;
			},
		): Promise<number> {
			try {
				await tracker.event(name, userId, properties, options);
				return 200; // Success
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				const statusCode =
					error instanceof Error && "statusCode" in error
						? (error.statusCode as number)
						: 500;
				throw new PulseHTTPError(statusCode, errorMessage);
			}
		},

		async identify(
			userId: string,
			properties: Properties = {},
			options?: {
				organizationId?: string | null;
			},
		): Promise<number> {
			try {
				await tracker.identify(userId, properties, options);
				return 200;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				const statusCode =
					error instanceof Error && "statusCode" in error
						? (error.statusCode as number)
						: 500;
				throw new PulseHTTPError(statusCode, errorMessage);
			}
		},
	};

	const c = {}; // Client-side tracking (empty for now)

	return { s, c };
}

export { AnalyticsTracker } from "./tracker.js";
export * from "./types.js";
