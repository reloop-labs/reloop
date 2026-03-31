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

	export const ingestLogsBody = t.Object({
		logs: t.Array(baseLogBody, {
			minItems: 1,
			description: "A batch of log entries to ingest",
		}),
	});

	export type IngestLogsBody = typeof ingestLogsBody.static;

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

	export const ingestLogsResponse = t.Object({
		logs: t.Array(logResponse, {
			description: "Stored log entry results",
		}),
		message: t.String({ description: "Batch ingest result" }),
	});

	export type IngestLogsResponse = typeof ingestLogsResponse.static;

	export const errorResponse = t.Object({
		message: t.String({ description: "Error message" }),
	});

	export type ErrorResponse = typeof errorResponse.static;
}
