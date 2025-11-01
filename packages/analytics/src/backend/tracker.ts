import { createId } from "@paralleldrive/cuid2";
import type { ClickHouseClient, ClickHouseClientOptions } from "../client.js";
import { createClickHouseClient } from "../client.js";
import { createTables, type EventData } from "../schema.js";
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
	private client: ClickHouseClient;
	private tablesCreated: boolean = false;

	constructor(config?: ClickHouseClientOptions) {
		this.client = createClickHouseClient(config);
	}

	private async ensureTables(): Promise<void> {
		if (!this.tablesCreated) {
			await createTables(this.client);
			this.tablesCreated = true;
		}
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
		await this.ensureTables();

		const timestamp = new Date();

		// Auto-enrich with backend properties from request context
		const enrichedProperties = {
			...getProperties(options?.requestContext),
			...properties,
			__pulse_client_lib: "pulse_node",
		};

		const eventData: EventData = {
			uuid: createId(),
			event: name,
			properties: JSON.stringify(enrichedProperties),
			distinct_id: userId,
			organization_id: options?.organizationId || null,
			user_id: userId,
			timestamp: timestamp,
			created_at: new Date(),
		};

		const database = this.client.config.database || "reloop_analytics";

		// Format timestamp for ClickHouse DateTime64
		const formatDateTime = (date: Date) => {
			return date.toISOString().replace("T", " ").substring(0, 23);
		};

		await this.client.insert({
			table: `${database}.events`,
			values: [
				{
					uuid: eventData.uuid,
					event: eventData.event,
					properties: eventData.properties,
					distinct_id: eventData.distinct_id,
					organization_id: eventData.organization_id,
					user_id: eventData.user_id,
					timestamp: formatDateTime(eventData.timestamp),
					created_at: formatDateTime(eventData.created_at),
				},
			],
			format: "JSONEachRow",
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

