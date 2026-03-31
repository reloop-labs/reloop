import { type ClickHouseClient, createClient } from "@clickhouse/client";
import { logger } from "@reloop/logger";
import { logsConfig } from "@reloop/logs/logs.config";
import type { LogsTypes } from "@reloop/logs/types/logs.type";

let clickhouseClient: ClickHouseClient | null = null;
let clickhouseAdminClient: ClickHouseClient | null = null;

type StoredLogEntry = {
	id: string;
	service: string;
	event: string;
	level: string;
	source: string | null;
	message: string | null;
	request_id: string | null;
	trace_id: string | null;
	span_id: string | null;
	user_id: string | null;
	distinct_id: string | null;
	organization_id: string | null;
	environment: string | null;
	tags: string;
	properties: string;
	metadata: string;
	occurred_at: string;
	ingested_at: string;
};

type ParsedLogEntry = Omit<
	StoredLogEntry,
	"tags" | "properties" | "metadata"
> & {
	tags: string[];
	properties: unknown;
	metadata: unknown;
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

		logger.info(
			{ database: logsConfig.clickhouse.database },
			"ClickHouse database ensured",
		);
	} catch (error) {
		logger.error(
			{
				database: logsConfig.clickhouse.database,
				error: error instanceof Error ? error.message : String(error),
			},
			"Failed to ensure ClickHouse database",
		);
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
					service LowCardinality(String),
					event String,
					level LowCardinality(String),
					source Nullable(String),
					message Nullable(String),
					request_id Nullable(String),
					trace_id Nullable(String),
					span_id Nullable(String),
					user_id Nullable(String),
					distinct_id Nullable(String),
					organization_id Nullable(String),
					environment Nullable(String),
					tags String,
					properties String,
					metadata String,
					occurred_at DateTime64(3),
					ingested_at DateTime64(3) DEFAULT now64(3)
				)
				ENGINE = MergeTree()
				ORDER BY (service, level, occurred_at, event, id)
				PARTITION BY toYYYYMM(occurred_at)
			`,
		});

		logger.info("ClickHouse logs table ensured");
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			"Failed to ensure ClickHouse logs table",
		);
		throw error;
	}
}

function toNullableString(value?: string | null): string | null {
	return value && value.length > 0 ? value : null;
}

function normalizeOccurredAt(value?: string): Date {
	if (!value) {
		return new Date();
	}

	const occurredAt = new Date(value);
	if (Number.isNaN(occurredAt.getTime())) {
		return new Date();
	}

	return occurredAt;
}

function normalizeLogEntry(body: LogsTypes.BaseLogBody): StoredLogEntry {
	const id = crypto.randomUUID();
	const occurredAt = normalizeOccurredAt(body.occurred_at);
	const ingestedAt = new Date();

	return {
		id,
		service: body.service || "unknown",
		event: body.event,
		level: body.level || "info",
		source: toNullableString(body.source),
		message: toNullableString(body.message),
		request_id: toNullableString(body.request_id),
		trace_id: toNullableString(body.trace_id),
		span_id: toNullableString(body.span_id),
		user_id: toNullableString(body.user_id),
		distinct_id: toNullableString(body.distinct_id || body.user_id),
		organization_id: toNullableString(body.organization_id),
		environment: toNullableString(
			body.environment || process.env.NODE_ENV || "development",
		),
		tags: JSON.stringify(body.tags || []),
		properties: JSON.stringify(body.properties || {}),
		metadata: JSON.stringify(body.metadata || {}),
		occurred_at: occurredAt.toISOString(),
		ingested_at: ingestedAt.toISOString(),
	};
}

function toLogResponse(entry: StoredLogEntry): LogsTypes.LogResponse {
	return {
		uuid: entry.id,
		service: entry.service,
		event: entry.event,
		level: entry.level,
		message: "Log ingested successfully",
	};
}

function safeJsonParse(value: string, fallback: unknown): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

function toLogEntryResponse(entry: StoredLogEntry): LogsTypes.LogEntryResponse {
	const parsed = entry as ParsedLogEntry;

	return {
		uuid: parsed.id,
		service: parsed.service,
		event: parsed.event,
		level: parsed.level,
		source: parsed.source,
		message: parsed.message,
		request_id: parsed.request_id,
		trace_id: parsed.trace_id,
		span_id: parsed.span_id,
		user_id: parsed.user_id,
		distinct_id: parsed.distinct_id,
		organization_id: parsed.organization_id,
		environment: parsed.environment,
		tags: Array.isArray(parsed.tags) ? parsed.tags : [],
		properties: parsed.properties,
		metadata: parsed.metadata,
		occurred_at: parsed.occurred_at,
		ingested_at: parsed.ingested_at,
	};
}

function parseStoredLogEntry(entry: StoredLogEntry): LogsTypes.LogEntryResponse {
	return toLogEntryResponse({
		...entry,
		tags: safeJsonParse(entry.tags, []) as string[],
		properties: safeJsonParse(entry.properties, {}),
		metadata: safeJsonParse(entry.metadata, {}),
	} as ParsedLogEntry as StoredLogEntry);
}

function escapeString(value: string): string {
	return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

export async function insertLog(
	body: LogsTypes.BaseLogBody,
): Promise<LogsTypes.LogResponse> {
	const client = getClickHouseClient();
	const entry = normalizeLogEntry(body);

	try {
		await client.insert({
			table: "logs",
			values: [entry],
			format: "JSONEachRow",
		});

		logger.debug(
			{
				service: entry.service,
				event: entry.event,
				level: entry.level,
				uuid: entry.id,
			},
			"Log inserted into ClickHouse",
		);

		return toLogResponse(entry);
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				service: entry.service,
				event: entry.event,
				level: entry.level,
			},
			"Failed to insert log into ClickHouse",
		);
		throw error;
	}
}

export async function listLogs(
	query: LogsTypes.ListLogsQuery,
): Promise<LogsTypes.LogEntryResponse[]> {
	const client = getClickHouseClient();
	const conditions: string[] = [];

	if (query.service) {
		conditions.push(`service = '${escapeString(query.service)}'`);
	}

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
					service,
					event,
					level,
					source,
					message,
					request_id,
					trace_id,
					span_id,
					user_id,
					distinct_id,
					organization_id,
					environment,
					tags,
					properties,
					metadata,
					toString(occurred_at) AS occurred_at,
					toString(ingested_at) AS ingested_at
				FROM logs
				${whereClause}
				ORDER BY occurred_at DESC, ingested_at DESC
				LIMIT ${limit}
			`,
			format: "JSONEachRow",
		});
		const rows = await resultSet.json<StoredLogEntry[]>();

		logger.debug(
			{
				count: rows.length,
			},
			"Logs fetched from ClickHouse",
		);

		return rows.map(parseStoredLogEntry);
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				service: query.service || null,
				level: query.level || null,
				event: query.event || null,
			},
			"Failed to fetch logs from ClickHouse",
		);
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
					service,
					event,
					level,
					source,
					message,
					request_id,
					trace_id,
					span_id,
					user_id,
					distinct_id,
					organization_id,
					environment,
					tags,
					properties,
					metadata,
					toString(occurred_at) AS occurred_at,
					toString(ingested_at) AS ingested_at
				FROM logs
				WHERE id = '${escapeString(logId)}'
				LIMIT 1
			`,
			format: "JSONEachRow",
		});
		const rows = await resultSet.json<StoredLogEntry[]>();
		const entry = rows[0];

		return entry ? parseStoredLogEntry(entry) : null;
	} catch (error) {
		logger.error(
			{
				logId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Failed to fetch log from ClickHouse",
		);
		throw error;
	}
}
