import type { ClickHouseClient } from "./client.js";
import { clickHouseClient } from "./client.js";

export async function createTables(
	client: ClickHouseClient = clickHouseClient,
): Promise<void> {
	const database = client.config.database || "reloop_analytics";

	// Create database if it doesn't exist
	await client.exec({
		query: `CREATE DATABASE IF NOT EXISTS ${database}`,
		clickhouse_settings: {
			wait_end_of_query: 1,
		},
	});

	// Create events table with PostHog-style schema
	const createTableQuery = `
		CREATE TABLE IF NOT EXISTS ${database}.events
		(
			uuid String,
			event String,
			properties String, -- JSON stored as String in ClickHouse
			distinct_id String,
			organization_id Nullable(String),
			user_id Nullable(String),
			timestamp DateTime64(3),
			created_at DateTime DEFAULT now()
		)
		ENGINE = ReplacingMergeTree(created_at)
		PARTITION BY toYYYYMM(timestamp)
		ORDER BY (timestamp, uuid)
		SETTINGS index_granularity = 8192
	`;

	await client.exec({
		query: createTableQuery,
		clickhouse_settings: {
			wait_end_of_query: 1,
		},
	});
}

export async function dropTables(
	client: ClickHouseClient = clickHouseClient,
): Promise<void> {
	const database = client.config.database || "reloop_analytics";

	await client.exec({
		query: `DROP TABLE IF EXISTS ${database}.events`,
		clickhouse_settings: {
			wait_end_of_query: 1,
		},
	});
}

export interface EventData {
	uuid: string;
	event: string;
	properties: string; // JSON string
	distinct_id: string;
	organization_id?: string | null;
	user_id?: string | null;
	timestamp: Date;
	created_at?: Date;
}

