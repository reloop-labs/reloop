import type { AnalyticsClient } from "../client.js";
import { analyticsClient } from "../client.js";
import { getProperties } from "./utils/properties.js";
import type { Properties } from "./utils/types.js";

export interface TrackOptions {
	distinctId: string;
	event: string;
	properties?: Properties;
	organizationId?: string | null;
	userId?: string | null;
	client?: AnalyticsClient;
}

export async function track(options: TrackOptions): Promise<void> {
	const {
		distinctId,
		event,
		properties = {},
		organizationId,
		userId,
		client = analyticsClient,
	} = options;

	// Auto-enrich with web properties
	const enrichedProperties = { ...getProperties(), ...properties };

	// Send event via HTTP API
	await client.track({
		event,
		properties: enrichedProperties,
		distinct_id: distinctId,
		user_id: userId || undefined,
		organization_id: organizationId || undefined,
	});
}

export async function identify(
	distinctId: string,
	properties: Properties = {},
	options?: {
		organizationId?: string | null;
		userId?: string | null;
		client?: AnalyticsClient;
	},
): Promise<void> {
	await track({
		distinctId,
		event: "$identify",
		properties,
		organizationId: options?.organizationId,
		userId: options?.userId,
		client: options?.client,
	});
}
