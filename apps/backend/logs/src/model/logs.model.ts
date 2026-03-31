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
		event: t.String({
			minLength: 1,
			description: "Event or log name (e.g., 'user_signed_up', 'email_sent')",
		}),
		level: t.String(logLevel),
		trace_id: t.String({ description: "Distributed trace identifier", }),
		metadata:
			t.Record(t.String(), structuredValue, {
				description: "Additional structured metadata for debugging and querying",
			}),
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
		trace_id: t.Union([t.String(), t.Null()]),
		metadata: t.Any(),
		created_at: t.String({ format: "date-time" }),
		request_details: t.Any()
	});

	export type LogEntryResponse = typeof logEntryResponse.static;

	export const logResponse = t.Object({
		uuid: t.String({ description: "Unique event identifier" }),
		event: t.String({ description: "Event name" }),
		level: t.String({ description: "Stored log level" }),
		trace_id: t.String({ description: "Distributed trace identifier" }),
		metadata: t.Any({ description: "Additional structured metadata" }),
		created_at: t.String({ format: "date-time" }),
		request_details: t.Any(),
	});

	export type LogResponse = typeof logResponse.static;

	export const createLogResponse = logResponse;
	export type CreateLogResponse = typeof createLogResponse.static;

	export const listLogsQuery = t.Object({
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
		log_id: t.String({
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
