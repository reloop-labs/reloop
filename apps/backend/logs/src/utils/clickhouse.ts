import { type ClickHouseClient, createClient } from "@clickhouse/client";
import { logsConfig } from "@reloop/logs/logs.config";

let clickhouseClient: ClickHouseClient | null = null;
let clickhouseAdminClient: ClickHouseClient | null = null;

export type StoredLogEntry = {
	id: string;
	event: string;
	level: string;
	trace_id: string | null;
	user_id: string | null;
	organization_id: string | null;
	metadata: string;
	request_details: string;
	created_at: string;
};


export function getClickHouseClient(): ClickHouseClient {
	if (!clickhouseClient) {
		clickhouseClient = createClient({
			url: logsConfig.clickhouse.url,
			username: logsConfig.clickhouse.username,
			password: logsConfig.clickhouse.password,
			database: logsConfig.clickhouse.database,
		});
	}
	return clickhouseClient;
}

function getClickHouseAdminClient(): ClickHouseClient {
	if (!clickhouseAdminClient) {
		clickhouseAdminClient = createClient({
			url: logsConfig.clickhouse.url,
			username: logsConfig.clickhouse.username,
			password: logsConfig.clickhouse.password,
		});
	}
	return clickhouseAdminClient;
}

export async function ensureDatabaseExists(): Promise<void> {
	const client = getClickHouseAdminClient();

	try {
		await client.exec({
			query: `CREATE DATABASE IF NOT EXISTS ${logsConfig.clickhouse.database}`,
		});

	} catch (error) {
		throw error;
	}
}

export async function ensureTableExists(): Promise<void> {
	await ensureDatabaseExists();
	const client = getClickHouseClient();

	try {
		await client.exec({
			query: `
				CREATE TABLE IF NOT EXISTS logs (
					id String,
					event String,
					level LowCardinality(String),
					trace_id Nullable(String),
					user_id Nullable(String),
					organization_id Nullable(String),
					metadata String,
					request_details String,
					created_at DateTime64(3)
				)
				ENGINE = MergeTree()
				ORDER BY (level, created_at, event, id)
				PARTITION BY toYYYYMM(created_at)
			`,
		});

	} catch (error) {
		throw error;
	}
}





