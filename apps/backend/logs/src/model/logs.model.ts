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

	// ─── Read-side response models ─────────────────────────────────────

	export const logEntryResponse = t.Object({
		uuid: t.String({ description: "Unique log identifier" }),
		event: t.String({ description: "Event or log name" }),
		level: t.String({ description: "Stored log level" }),
		trace_id: t.Union([t.String(), t.Null()]),
		metadata: t.Any(),
		status_code: t.Union([t.Number(), t.Null()], {
			description: "HTTP status code",
		}),
		created_at: t.String({ format: "date-time" }),
		requestDetails: t.Any(),
		email: t.Optional(t.Any()),
		// Audit-log fields
		actor_type: t.Optional(t.Union([t.String(), t.Null()])),
		actor_id: t.Optional(t.Union([t.String(), t.Null()])),
		resource_type: t.Optional(t.Union([t.String(), t.Null()])),
		resource_id: t.Optional(t.Union([t.String(), t.Null()])),
		service: t.Optional(t.Union([t.String(), t.Null()])),
		action: t.Optional(t.Union([t.String(), t.Null()])),
		ip_address: t.Optional(t.Union([t.String(), t.Null()])),
		user_agent: t.Optional(t.Union([t.String(), t.Null()])),
		environment: t.Optional(t.Union([t.String(), t.Null()])),
	});

	export type LogEntryResponse = typeof logEntryResponse.static;

	export const logResponse = t.Object({
		uuid: t.String({ description: "Unique event identifier" }),
		event: t.String({ description: "Event name" }),
		level: t.String({ description: "Stored log level" }),
		trace_id: t.String({ description: "Distributed trace identifier" }),
		metadata: t.Any({ description: "Additional structured metadata" }),
		status_code: t.Union([t.Number(), t.Null()], {
			description: "HTTP status code",
		}),
		created_at: t.String({ format: "date-time" }),
		requestDetails: t.Any(),
		email: t.Optional(t.Any()),
		// Audit-log fields
		actor_type: t.Optional(t.Union([t.String(), t.Null()])),
		actor_id: t.Optional(t.Union([t.String(), t.Null()])),
		resource_type: t.Optional(t.Union([t.String(), t.Null()])),
		resource_id: t.Optional(t.Union([t.String(), t.Null()])),
		service: t.Optional(t.Union([t.String(), t.Null()])),
		action: t.Optional(t.Union([t.String(), t.Null()])),
		ip_address: t.Optional(t.Union([t.String(), t.Null()])),
		user_agent: t.Optional(t.Union([t.String(), t.Null()])),
		environment: t.Optional(t.Union([t.String(), t.Null()])),
	});

	export type LogResponse = typeof logResponse.static;

	export const listLogsQuery = t.Object({
		level: t.Optional(logLevel),
		event: t.Optional(
			t.String({ description: "Filter by event name (partial match)" }),
		),
		status_code: t.Optional(
			t.String({
				description: "Filter by status code (number or 'success', 'error')",
			}),
		),
		search: t.Optional(
			t.String({ description: "Search across event name and metadata" }),
		),
		organization_id: t.Optional(t.String()),
		start_date: t.Optional(
			t.String({
				format: "date-time",
				description: "Filter logs from this date (ISO 8601)",
			}),
		),
		end_date: t.Optional(
			t.String({
				format: "date-time",
				description: "Filter logs until this date (ISO 8601)",
			}),
		),
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
		// Audit-log filters
		service: t.Optional(
			t.String({
				description: "Filter by source service (api_key, domain, mailing…)",
			}),
		),
		action: t.Optional(
			t.String({
				description: "Filter by action verb (created, deleted, sent…)",
			}),
		),
		resource_type: t.Optional(
			t.String({
				description: "Filter by resource type (api_key, domain, email…)",
			}),
		),
		resource_id: t.Optional(
			t.String({ description: "Filter by specific resource ID" }),
		),
		actor_type: t.Optional(
			t.Union([t.Literal("user"), t.Literal("api_key"), t.Literal("system")], {
				description: "Filter by actor type",
			}),
		),
		actor_id: t.Optional(
			t.String({ description: "Filter by actor ID (user_id or api_key_id)" }),
		),
		environment: t.Optional(
			t.Union(
				[t.Literal("production"), t.Literal("development"), t.Literal("test")],
				{ description: "Filter by environment" },
			),
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

	export const logNotFound = t.Object({
		message: t.Literal("Log not found"),
	});
	export type LogNotFound = typeof logNotFound.static;

	export const emailLogNotFound = t.Object({
		message: t.Literal("Email log not found"),
	});
	export type EmailLogNotFound = typeof emailLogNotFound.static;

	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
	});
	export type Unauthorized = typeof unauthorized.static;

	export const forbidden = t.Object({
		message: t.Literal("Access forbidden"),
	});
	export type Forbidden = typeof forbidden.static;

	export const badRequest = t.Object({
		message: t.String({ description: "Bad request" }),
	});
	export type BadRequest = typeof badRequest.static;

	export const internalServerError = t.Object({
		message: t.Literal("Internal server error"),
	});
	export type InternalServerError = typeof internalServerError.static;

	// Email Logs
	export const listEmailLogsQuery = t.Object({
		page: t.Optional(t.Numeric({ default: 1 })),
		limit: t.Optional(t.Numeric({ default: 10 })),
		search: t.Optional(t.String()),
		status: t.Optional(t.String()),
	});
	export type ListEmailLogsQuery = typeof listEmailLogsQuery.static;

	export const emailLogEntry = t.Object({
		id: t.String(),
		subject: t.String(),
		fromEmail: t.String(),
		toEmails: t.Array(t.String()),
		status: t.String(),
		createdAt: t.String(),
	});

	export const listEmailLogsResponse = t.Object({
		object: t.Literal("list"),
		data: t.Array(emailLogEntry),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});
	export type ListEmailLogsResponse = typeof listEmailLogsResponse.static;

	export const emailEventLine = t.Object({
		id: t.String(),
		type: t.String(),
		metadata: t.Union([t.Any(), t.Null()]),
		createdAt: t.String(),
	});
	export type EmailEventLine = typeof emailEventLine.static;

	export const emailLogFullEntry = t.Object({
		id: t.String(),
		messageId: t.String(),
		organizationId: t.String(),
		domainId: t.String(),
		fromEmail: t.String(),
		fromName: t.Union([t.String(), t.Null()]),
		toEmails: t.Array(t.String()),
		ccEmails: t.Union([t.Array(t.String()), t.Null()]),
		bccEmails: t.Union([t.Array(t.String()), t.Null()]),
		replyTo: t.Union([t.String(), t.Null()]),
		subject: t.String(),
		textBody: t.Union([t.String(), t.Null()]),
		htmlBody: t.Union([t.String(), t.Null()]),
		status: t.String(),
		errorMessage: t.Union([t.String(), t.Null()]),
		provider: t.String(),
		size: t.Number(),
		headers: t.Union([t.Record(t.String(), t.String()), t.Null()]),
		sentAt: t.Union([t.String(), t.Null()]),
		deliveredAt: t.Union([t.String(), t.Null()]),
		failedAt: t.Union([t.String(), t.Null()]),
		createdAt: t.String(),
		updatedAt: t.String(),
		events: t.Optional(t.Array(emailEventLine)),
	});
	export type EmailLogFullEntry = typeof emailLogFullEntry.static;

	export const emailStatsQuery = t.Object({
		organization_id: t.Optional(t.String()),
		domain_id: t.Optional(t.String()),
		start_date: t.Optional(t.String({ format: "date-time" })),
		end_date: t.Optional(t.String({ format: "date-time" })),
		interval: t.Optional(
			t.Union([t.Literal("day"), t.Literal("hour")], { default: "day" }),
		),
	});
	export type EmailStatsQuery = typeof emailStatsQuery.static;

	export const emailStatsResponse = t.Object({
		dates: t.Array(t.String()),
		sent: t.Array(t.Number()),
		delivered: t.Array(t.Number()),
		bounced: t.Array(t.Number()),
		complaint: t.Array(t.Number()),
		rate: t.Array(t.Number()),
		bounceBreakdown: t.Object({
			transient: t.Array(t.Number()),
			permanent: t.Array(t.Number()),
			undetermined: t.Array(t.Number()),
		}),
	});
	export type EmailStatsResponse = typeof emailStatsResponse.static;

	export const getEmailLogParams = t.Object({
		id: t.String(),
	});
	export type GetEmailLogParams = typeof getEmailLogParams.static;
}
