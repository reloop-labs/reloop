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
	status_code: number | null;
	created_at: string;
	// Audit-log fields
	actor_type: string | null;
	actor_id: string | null;
	resource_type: string | null;
	resource_id: string | null;
	service: string | null;
	action: string | null;
	ip_address: string | null;
	user_agent: string | null;
	environment: string | null;
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
	const database = logsConfig.clickhouse.database;

	try {
		await client.exec({
			query: `CREATE DATABASE IF NOT EXISTS \`${database}\``,
		});
	} catch (error) {
		console.error(`Error creating database ${database}:`, error);
		throw error;
	}
}

export async function ensureTableExists(): Promise<void> {
	await ensureDatabaseExists();
	const client = getClickHouseClient();

	const tableSchema = [
		{ name: "id", type: "String" },
		{ name: "event", type: "String" },
		{ name: "level", type: "LowCardinality(String)" },
		{ name: "trace_id", type: "Nullable(String)" },
		{ name: "user_id", type: "Nullable(String)" },
		{ name: "organization_id", type: "Nullable(String)" },
		{ name: "metadata", type: "String" },
		{ name: "request_details", type: "String" },
		{ name: "status_code", type: "Nullable(Int32)" },
		{ name: "created_at", type: "DateTime64(3)" },
		// Audit-log fields
		{ name: "actor_type", type: "LowCardinality(String)" },
		{ name: "actor_id", type: "Nullable(String)" },
		{ name: "resource_type", type: "LowCardinality(String)" },
		{ name: "resource_id", type: "Nullable(String)" },
		{ name: "service", type: "LowCardinality(String)" },
		{ name: "action", type: "LowCardinality(String)" },
		{ name: "ip_address", type: "Nullable(String)" },
		{ name: "user_agent", type: "Nullable(String)" },
		{ name: "environment", type: "LowCardinality(String)" },
	];

	try {
		// Check if table exists and get its schema
		const resultSet = await client.query({
			query: "DESCRIBE TABLE logs",
			format: "JSONEachRow",
		});

		const currentSchema = await resultSet.json<{
			name: string;
			type: string;
		}>();

		// Map current schema to a comparable format
		const currentColumns = currentSchema.map((col) => ({
			name: col.name,
			type: col.type,
		}));

		// Compare schema
		const isSchemaMatch =
			tableSchema.every((expected) =>
				currentColumns.some(
					(current) =>
						current.name === expected.name && current.type === expected.type,
				),
			) && tableSchema.length === currentColumns.length;

		if (!isSchemaMatch) {
			console.log(
				"ClickHouse logs table schema mismatch. Dropping and recreating table...",
			);
			await client.exec({
				query: "DROP TABLE logs",
			});
		}
	} catch (error: unknown) {
		// If table doesn't exist, DESCRIBE will throw. We can ignore this and proceed to CREATE.
		if (
			error instanceof Error &&
			!error.message?.includes("doesn't exist") &&
			!error.message?.includes("does not exist") &&
			!error.message?.includes("not found")
		) {
			console.error("Error checking ClickHouse table schema:", error);
		}
	}

	try {
		await client.exec({
			query: `
				CREATE TABLE IF NOT EXISTS \`${logsConfig.clickhouse.database}\`.logs (
					id String,
					event String,
					level LowCardinality(String),
					trace_id Nullable(String),
					user_id Nullable(String),
					organization_id Nullable(String),
					metadata String,
					request_details String,
					status_code Nullable(Int32),
					created_at DateTime64(3),
					-- Audit-log fields
					actor_type LowCardinality(String) DEFAULT '',
					actor_id Nullable(String),
					resource_type LowCardinality(String) DEFAULT '',
					resource_id Nullable(String),
					service LowCardinality(String) DEFAULT '',
					action LowCardinality(String) DEFAULT '',
					ip_address Nullable(String),
					user_agent Nullable(String),
					environment LowCardinality(String) DEFAULT ''
				)
				ENGINE = MergeTree()
				ORDER BY (organization_id, service, created_at, id)
				PARTITION BY toYYYYMM(created_at)
				SETTINGS allow_nullable_key = 1
			`,
		});
		console.log(
			`Successfully ensured table \`${logsConfig.clickhouse.database}\`.logs exists`,
		);
	} catch (error) {
		console.error(
			`Error creating table \`${logsConfig.clickhouse.database}\`.logs:`,
			error,
		);
		throw error;
	}
}
