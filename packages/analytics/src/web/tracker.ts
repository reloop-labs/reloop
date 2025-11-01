import { createId } from "@paralleldrive/cuid2";
import type { ClickHouseClient } from "../client.js";
import { clickHouseClient } from "../client.js";
import { createTables, type EventData } from "../schema.js";
import type { Properties } from "./utils/types.js";
import { getProperties } from "./utils/properties.js";

export interface TrackOptions {
	distinctId: string;
	event: string;
	properties?: Properties;
	organizationId?: string | null;
	userId?: string | null;
	client?: ClickHouseClient;
}

export async function track(options: TrackOptions): Promise<void> {
	const {
		distinctId,
		event,
		properties = {},
		organizationId,
		userId,
		client = clickHouseClient,
	} = options;

	// Ensure tables exist
	await createTables(client);

	// Auto-enrich with web properties
	const enrichedProperties = { ...getProperties(), ...properties };

	const eventData: EventData = {
		uuid: createId(),
		event,
		properties: JSON.stringify(enrichedProperties),
		distinct_id: distinctId,
		organization_id: organizationId || null,
		user_id: userId || null,
		timestamp: new Date(),
		created_at: new Date(),
	};

	const database = client.config.database || "reloop_analytics";

	// Format timestamp for ClickHouse DateTime64
	const formatDateTime = (date: Date) => {
		return date.toISOString().replace("T", " ").substring(0, 23);
	};

	await client.insert({
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

export async function identify(
	distinctId: string,
	properties: Properties = {},
	options?: {
		organizationId?: string | null;
		userId?: string | null;
		client?: ClickHouseClient;
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

