import type {
	AnalyticsClient,
	AnalyticsClientOptions,
} from "../client.js";
import { createAnalyticsClient } from "../client.js";
import type { Properties } from "./types.js";
import { getProperties, type RequestContext } from "./utils/properties.js";

export interface TrackOptions {
	name: string;
	userId: string;
	properties?: Properties;
	organizationId?: string | null;
	requestContext?: RequestContext;
}

export class AnalyticsTracker {
	private client: AnalyticsClient;

	constructor(config?: AnalyticsClientOptions) {
		this.client = createAnalyticsClient(config);
	}

	async event(
		name: string,
		userId: string,
		properties: Properties = {},
		options?: {
			organizationId?: string | null;
			requestContext?: RequestContext;
		},
	): Promise<void> {
		// Auto-enrich with backend properties from request context
		const enrichedProperties = {
			...getProperties(options?.requestContext),
			...properties,
			__pulse_client_lib: "pulse_node",
		};

		// Send event via HTTP API
		await this.client.track({
			event: name,
			properties: enrichedProperties,
			distinct_id: userId,
			user_id: userId,
			organization_id: options?.organizationId || undefined,
		});
	}

	async identify(
		userId: string,
		properties: Properties = {},
		options?: {
			organizationId?: string | null;
			requestContext?: RequestContext;
		},
	): Promise<void> {
		await this.event("$identify", userId, properties, options);
	}
}
