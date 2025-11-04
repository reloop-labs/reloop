import type { AnalyticsClient, AnalyticsClientOptions } from "../client.js";
import { createAnalyticsClient } from "../client.js";
import type { Properties } from "./types.js";

export interface TrackOptions {
	name: string;
	userId: string;
	properties?: Properties;
	organizationId?: string | null;
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
		},
	): Promise<void> {
		// Just do a fetch call with the input properties as-is, no enrichment
		await this.client.track({
			event: name,
			properties: properties,
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
		},
	): Promise<void> {
		await this.event("$identify", userId, properties, options);
	}
}
