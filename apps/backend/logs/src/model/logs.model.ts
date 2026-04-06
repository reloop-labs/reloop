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

	export const logSource = t.Union(
		[
			t.Literal("email"),
			t.Literal("auth"),
			t.Literal("domain"),
			t.Literal("api_key"),
			t.Literal("webhook"),
			t.Literal("contact"),
			t.Literal("template"),
			t.Literal("settings"),
			t.Literal("manual"),
		],
		{
			description: "Source service or category that generated this log",
		},
	);

	export const structuredValue = t.Any({
		description: "Any valid JSON-compatible structured value",
	});

	export const baseLogBody = t.Object({
		event: t.String({
			minLength: 1,
			description: "Event or log name (e.g., 'user_signed_up', 'email_sent')",
		}),
		level: t.String(logLevel),
		source: t.Optional(logSource),
		trace_id: t.String({ description: "Distributed trace identifier" }),
		metadata:
			t.Record(t.String(), structuredValue, {
				description: "Additional structured metadata for debugging and querying",
			}),
		status_code: t.Optional(t.Union([t.Number(), t.String()], { description: "HTTP status code if applicable" })),
		requestDetails:
			t.Record(t.String(), structuredValue, {
				description: "Additional structured metadata for debugging and querying",
			}),
	});

	export type BaseLogBody = typeof baseLogBody.static;

	export const createLogBody = baseLogBody;
	export type CreateLogBody = typeof createLogBody.static;

	export const logEntryResponse = t.Object({
		uuid: t.String({ description: "Unique log identifier" }),
		event: t.String({ description: "Event or log name" }),
		level: t.String({ description: "Stored log level" }),
		source: t.Union([t.String(), t.Null()], { description: "Source service or category" }),
		trace_id: t.Union([t.String(), t.Null()]),
		metadata: t.Any(),
		status_code: t.Union([t.Number(), t.Null()], { description: "HTTP status code" }),
		created_at: t.String({ format: "date-time" }),
		requestDetails: t.Any(),
	});

	export type LogEntryResponse = typeof logEntryResponse.static;

	export const logResponse = t.Object({
		uuid: t.String({ description: "Unique event identifier" }),
		event: t.String({ description: "Event name" }),
		level: t.String({ description: "Stored log level" }),
		source: t.Union([t.String(), t.Null()], { description: "Source service or category" }),
		trace_id: t.String({ description: "Distributed trace identifier" }),
		metadata: t.Any({ description: "Additional structured metadata" }),
		status_code: t.Union([t.Number(), t.Null()], { description: "HTTP status code" }),
		created_at: t.String({ format: "date-time" }),
		requestDetails: t.Any(),
	});

	export type LogResponse = typeof logResponse.static;

	export const createLogResponse = logResponse;
	export type CreateLogResponse = typeof createLogResponse.static;

	export const listLogsQuery = t.Object({
		level: t.Optional(logLevel),
		source: t.Optional(logSource),
		event: t.Optional(t.String({ description: "Filter by event name (partial match)" })),
		status_code: t.Optional(t.String({ description: "Filter by status code (number or 'success', 'error')" })),
		search: t.Optional(t.String({ description: "Search across event name and metadata" })),
		organization_id: t.Optional(t.String()),
		start_date: t.Optional(t.String({ format: "date-time", description: "Filter logs from this date (ISO 8601)" })),
		end_date: t.Optional(t.String({ format: "date-time", description: "Filter logs until this date (ISO 8601)" })),
		limit: t.Optional(
			t.Numeric({
				minimum: 1,
				maximum: 100,
				description: "Maximum number of log entries to return",
			}),
		),
		page: t.Optional(
			t.Numeric({
				minimum: 1,
				description: "Page number for pagination",
			}),
		),
	});

	export type ListLogsQuery = typeof listLogsQuery.static;

	export const getLogParams = t.Object({
		log_id: t.String({
			minLength: 1,
			description: "Unique log identifier",
		}),
	});

	export type GetLogParams = typeof getLogParams.static;

	export const levelStats = t.Object({
		debug: t.Number(),
		info: t.Number(),
		warn: t.Number(),
		error: t.Number(),
		fatal: t.Number(),
	});

	export type LevelStats = typeof levelStats.static;

	export const listLogsResponse = t.Object({
		logs: t.Array(logEntryResponse),
		count: t.Number(),
		stats: t.Optional(levelStats),
	});

	export type ListLogsResponse = typeof listLogsResponse.static;

	export const errorResponse = t.Object({
		message: t.String({ description: "Error message" }),
	});

	export type ErrorResponse = typeof errorResponse.static;
}
