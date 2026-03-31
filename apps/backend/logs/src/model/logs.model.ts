import { t } from "elysia";

export namespace LogsModel {
	export const logLevel = t.Union(
		[
			t.Literal("debug"),
			t.Literal("info"),
			t.Literal("warn"),
			t.Literal("error"),
			t.Literal("fatal"),
		],
		{
			description: "Structured log severity level",
		},
	);

	export const structuredValue = t.Any({
		description: "Any valid JSON-compatible structured value",
	});

	export const baseLogBody = t.Object({
		service: t.Optional(
			t.String({
				minLength: 1,
				description: "Service name emitting the log entry",
			}),
		),
		event: t.String({
			minLength: 1,
			description: "Event or log name (e.g., 'user_signed_up', 'email_sent')",
		}),
		level: t.Optional(logLevel),
		source: t.Optional(
			t.String({
				description: "Source component or subsystem inside the service",
			}),
		),
		message: t.Optional(
			t.String({
				description: "Human-readable log message",
			}),
		),
		properties: t.Optional(
			t.Record(t.String(), structuredValue, {
				description: "Structured event or log properties",
			}),
		),
		metadata: t.Optional(
			t.Record(t.String(), structuredValue, {
				description: "Additional structured metadata for debugging and querying",
			}),
		),
		distinct_id: t.Optional(
			t.String({
				description: "Distinct identifier for the user/entity",
			}),
		),
		user_id: t.Optional(
			t.String({
				description: "User identifier",
			}),
		),
		organization_id: t.Optional(
			t.String({
				description: "Organization identifier",
			}),
		),
		request_id: t.Optional(
			t.String({
				description: "Request identifier for correlating application flows",
			}),
		),
		trace_id: t.Optional(
			t.String({
				description: "Distributed trace identifier",
			}),
		),
		span_id: t.Optional(
			t.String({
				description: "Distributed trace span identifier",
			}),
		),
		environment: t.Optional(
			t.String({
				description: "Runtime environment, such as local, staging, or production",
			}),
		),
		tags: t.Optional(
			t.Array(t.String(), {
				description: "Tags for filtering and grouping related logs",
			}),
		),
		occurred_at: t.Optional(
			t.String({
				format: "date-time",
				description: "RFC 3339 timestamp representing when the event occurred",
			}),
		),
	});

	export type BaseLogBody = typeof baseLogBody.static;

	export const ingestLogBody = baseLogBody;
	export type IngestLogBody = typeof ingestLogBody.static;

	export const logEntryResponse = t.Object({
		uuid: t.String({ description: "Unique log identifier" }),
		service: t.String({ description: "Service name emitting the log entry" }),
		event: t.String({ description: "Event or log name" }),
		level: t.String({ description: "Stored log level" }),
		source: t.Union([t.String(), t.Null()]),
		message: t.Union([t.String(), t.Null()]),
		request_id: t.Union([t.String(), t.Null()]),
		trace_id: t.Union([t.String(), t.Null()]),
		span_id: t.Union([t.String(), t.Null()]),
		user_id: t.Union([t.String(), t.Null()]),
		distinct_id: t.Union([t.String(), t.Null()]),
		organization_id: t.Union([t.String(), t.Null()]),
		environment: t.Union([t.String(), t.Null()]),
		tags: t.Array(t.String()),
		properties: t.Any(),
		metadata: t.Any(),
		occurred_at: t.String({ format: "date-time" }),
		ingested_at: t.String({ format: "date-time" }),
	});

	export type LogEntryResponse = typeof logEntryResponse.static;

	export const logResponse = t.Object({
		uuid: t.String({ description: "Unique event identifier" }),
		service: t.String({ description: "Service name emitting the log entry" }),
		event: t.String({ description: "Event name" }),
		level: t.String({ description: "Stored log level" }),
		message: t.String({ description: "Success message" }),
	});

	export type LogResponse = typeof logResponse.static;

	export const ingestLogResponse = logResponse;
	export type IngestLogResponse = typeof ingestLogResponse.static;

	export const listLogsQuery = t.Object({
		service: t.Optional(t.String()),
		level: t.Optional(logLevel),
		event: t.Optional(t.String()),
		organization_id: t.Optional(t.String()),
		limit: t.Optional(
			t.Numeric({
				minimum: 1,
				maximum: 100,
				description: "Maximum number of log entries to return",
			}),
		),
	});

	export type ListLogsQuery = typeof listLogsQuery.static;

	export const getLogParams = t.Object({
		logId: t.String({
			minLength: 1,
			description: "Unique log identifier",
		}),
	});

	export type GetLogParams = typeof getLogParams.static;

	export const listLogsResponse = t.Object({
		logs: t.Array(logEntryResponse),
		count: t.Number(),
	});

	export type ListLogsResponse = typeof listLogsResponse.static;

	export const errorResponse = t.Object({
		message: t.String({ description: "Error message" }),
	});

	export type ErrorResponse = typeof errorResponse.static;
}
