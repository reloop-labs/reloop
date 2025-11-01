import { AnalyticsTracker } from "./tracker.js";
import type { ClickHouseClientOptions } from "../client.js";
import type { Properties } from "./types.js";
import type { RequestContext } from "./utils/properties.js";
import { PulseHTTPError } from "./types.js";

export interface AnalyticsConfig extends ClickHouseClientOptions {
	// Additional config options can be added here
}

export default function analytics(config?: AnalyticsConfig | string) {
	// If config is a string, treat it as a domain/URL (for backward compatibility)
	const clickHouseConfig: ClickHouseClientOptions | undefined =
		typeof config === "string"
			? { url: config }
			: config;

	const tracker = new AnalyticsTracker(clickHouseConfig);

	const s = {
		async event(
			name: string,
			userId: string,
			properties: Properties = {},
			options?: {
				organizationId?: string | null;
				requestContext?: RequestContext;
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
				requestContext?: RequestContext;
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

export * from "./types.js";
export { AnalyticsTracker } from "./tracker.js";
export type { RequestContext } from "./utils/properties.js";

