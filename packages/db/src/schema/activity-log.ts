import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const activityLog = pgTable(
	"activity_log",
	{
		id: text("id").primaryKey(),
		event: text("event").notNull(),
		level: text("level").notNull(),
		traceId: text("trace_id"),
		userId: text("user_id"),
		organizationId: text("organization_id"),
		metadata: jsonb("metadata")
			.$type<Record<string, unknown>>()
			.notNull()
			.default({}),
		requestDetails: jsonb("request_details")
			.$type<Record<string, unknown>>()
			.notNull()
			.default({}),
		requestBody: jsonb("request_body")
			.$type<Record<string, unknown>>()
			.notNull()
			.default({}),
		statusCode: integer("status_code"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		actorType: text("actor_type").notNull().default(""),
		actorId: text("actor_id"),
		resourceType: text("resource_type").notNull().default(""),
		resourceId: text("resource_id"),
		service: text("service").notNull().default(""),
		action: text("action").notNull().default(""),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		environment: text("environment").notNull().default(""),
	},
	(table) => [
		index("activity_log_idx_org_created").on(
			table.organizationId,
			table.createdAt,
		),
		index("activity_log_idx_org_service_created").on(
			table.organizationId,
			table.service,
			table.createdAt,
		),
		index("activity_log_idx_org_level").on(table.organizationId, table.level),
		index("activity_log_idx_org_resource").on(
			table.organizationId,
			table.resourceType,
			table.resourceId,
			table.createdAt,
		),
	],
);
