import { type ClickHouseClient, createClient } from "@clickhouse/client";
import { logsConfig } from "@reloop/logs/logs.config";
import type { LogsTypes } from "@reloop/logs/types/logs.type";

let clickhouseClient: ClickHouseClient | null = null;
let clickhouseAdminClient: ClickHouseClient | null = null;

type StoredLogEntry = {
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



function safeJsonParse(value: string, fallback: unknown): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}


function parseStoredLogEntry(entry: StoredLogEntry): LogsTypes.LogEntryResponse {
	return {
		uuid: entry.id,
		event: entry.event,
		level: entry.level,
		trace_id: entry.trace_id,
		metadata: safeJsonParse(entry.metadata, {}),
		created_at: entry.created_at,
		request_details: safeJsonParse(entry.request_details, {}),
	};
}

function escapeString(value: string): string {
	return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}


export async function listLogs(
	query: LogsTypes.ListLogsQuery,
): Promise<LogsTypes.LogEntryResponse[]> {
	const client = getClickHouseClient();
	const conditions: string[] = [];


	if (query.level) {
		conditions.push(`level = '${escapeString(query.level)}'`);
	}

	if (query.event) {
		conditions.push(`event = '${escapeString(query.event)}'`);
	}

	if (query.organization_id) {
		conditions.push(
			`organization_id = '${escapeString(query.organization_id)}'`,
		);
	}

	const whereClause =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	const limit = Math.min(Math.max(Number(query.limit || 25), 1), 100);

	try {
		const resultSet = await client.query({
			query: `
				SELECT
					id,
					event,
					level,
					trace_id,
					user_id,
					organization_id,
					metadata,
					request_details,
					toString(created_at) AS created_at
				FROM logs
				${whereClause}
				ORDER BY created_at DESC
				LIMIT ${limit}
			`,
			format: "JSONEachRow",
		});
		const rows = (await resultSet.json()) as StoredLogEntry[];


		return rows.map(parseStoredLogEntry);
	} catch (error) {
		throw error;
	}
}

export async function getLogById(
	logId: string,
): Promise<LogsTypes.LogEntryResponse | null> {
	const client = getClickHouseClient();

	try {
		const resultSet = await client.query({
			query: `
				SELECT
					id,
					event,
					level,
					trace_id,
					user_id,
					organization_id,
					metadata,
					request_details,
					toString(created_at) AS created_at
				FROM logs
				WHERE id = '${escapeString(logId)}'
				LIMIT 1
			`,
			format: "JSONEachRow",
		});
		const rows = (await resultSet.json()) as StoredLogEntry[];
		const entry = rows[0];

		return entry ? parseStoredLogEntry(entry) : null;
	} catch (error) {
		throw error;
	}
}
