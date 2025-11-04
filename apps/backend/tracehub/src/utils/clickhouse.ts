import { type ClickHouseClient, createClient } from "@clickhouse/client";
import { logger } from "@reloop/logger";

let clickhouseClient: ClickHouseClient | null = null;

export function getClickHouseClient(): ClickHouseClient {
	if (!clickhouseClient) {
		clickhouseClient = createClient({
			host: process.env.CLICKHOUSE_HOST || "http://localhost:8123",
			username: process.env.CLICKHOUSE_USER || "reloop",
			password: process.env.CLICKHOUSE_PASSWORD || "reloop123",
			database: process.env.CLICKHOUSE_DATABASE || "reloop_tracehub",
		});
	}
	return clickhouseClient;
}

export async function ensureTableExists(): Promise<void> {
	const client = getClickHouseClient();

	try {
		// Create events table if it doesn't exist
		await client.exec({
			query: `
				CREATE TABLE IF NOT EXISTS events (
					id String,
					event String,
					user_id String,
					distinct_id String,
					organization_id Nullable(String),
					properties String,
					timestamp DateTime DEFAULT now()
				)
				ENGINE = MergeTree()
				ORDER BY (timestamp, event, user_id)
				PARTITION BY toYYYYMM(timestamp)
			`,
		});

		logger.info("ClickHouse events table ensured");
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			"Failed to ensure ClickHouse events table",
		);
		throw error;
	}
}

export async function insertEvent(
	event: string,
	userId: string,
	distinctId: string,
	properties: Record<string, string | number>,
	organizationId?: string | null,
): Promise<string> {
	const client = getClickHouseClient();
	const uuid = crypto.randomUUID();

	try {
		await client.insert({
			table: "events",
			values: [
				{
					id: uuid,
					event,
					user_id: userId,
					distinct_id: distinctId,
					organization_id: organizationId || null,
					properties: JSON.stringify(properties),
					timestamp: new Date(),
				},
			],
			format: "JSONEachRow",
		});

		logger.debug(
			{
				event,
				userId,
				uuid,
			},
			"Event inserted into ClickHouse",
		);

		return uuid;
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				event,
				userId,
			},
			"Failed to insert event into ClickHouse",
		);
		throw error;
	}
}
