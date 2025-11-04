import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

const createWebhookEventId = () => `whevt_${createId()}`;
const createWebhookId = () => `wh_${createId()}`;
const createWebhookSubscriptionId = () => `whsub_${createId()}`;
const createWebhookDeliveryId = () => `whde_${createId()}`;

export const webhookStatusEnum = pgEnum("webhook_status", [
	"active",
	"paused",
	"disabled",
	"failed",
]);

export const webhookDeliveryStatusEnum = pgEnum("webhook_delivery_status", [
	"pending",
	"success",
	"failed",
	"retrying",
]);

export const webhookEvent = pgTable(
	"webhook_event",
	{
		id: text("id")
			.$defaultFn(() => createWebhookEventId())
			.primaryKey(),
		name: varchar("name", { length: 255 }).notNull().unique(),
		description: text("description"),
		category: varchar("category", { length: 255 }).notNull(),
		isActive: boolean("is_active").notNull().default(true),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("webhook_event_idx_name").on(table.name),
		index("webhook_event_idx_category").on(table.category),
		index("webhook_event_idx_is_active").on(table.isActive),
	],
);

export const webhook = pgTable(
	"webhook",
	{
		id: text("id")
			.$defaultFn(() => createWebhookId())
			.primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		url: text("url").notNull(),
		secret: text("secret"),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: webhookStatusEnum("status").notNull().default("active"),
		customHeaders: jsonb("custom_headers").$type<Record<string, string>>(),
		rateLimitEnabled: boolean("rate_limit_enabled").notNull().default(true),
		maxRequestsPerMinute: integer("max_requests_per_minute")
			.notNull()
			.default(60),
		maxRetries: integer("max_retries").notNull().default(3),
		retryBackoffMultiplier: integer("retry_backoff_multiplier")
			.notNull()
			.default(2),
		filteringOptions:
			jsonb("filtering_options").$type<Record<string, unknown>>(),
		lastTriggeredAt: timestamp("last_triggered_at"),
		successCount: integer("success_count").notNull().default(0),
		failureCount: integer("failure_count").notNull().default(0),
		consecutiveFailures: integer("consecutive_failures").notNull().default(0),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("webhook_idx_organization_id").on(table.organizationId),
		index("webhook_idx_user_id").on(table.userId),
		index("webhook_idx_status").on(table.status),
		index("webhook_idx_deleted_at").on(table.deletedAt),
		index("webhook_idx_org_status").on(table.organizationId, table.status),
		index("webhook_idx_org_deleted").on(table.organizationId, table.deletedAt),
		index("webhook_idx_last_triggered").on(table.lastTriggeredAt),
	],
);

export const webhookEventSubscription = pgTable(
	"webhook_event_subscription",
	{
		id: text("id")
			.$defaultFn(() => createWebhookSubscriptionId())
			.primaryKey(),
		webhookId: text("webhook_id")
			.notNull()
			.references(() => webhook.id, { onDelete: "cascade" }),
		eventId: text("event_id")
			.notNull()
			.references(() => webhookEvent.id, { onDelete: "cascade" }),
		isEnabled: boolean("is_enabled").notNull().default(true),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("webhook_event_subscription_idx_webhook_id").on(table.webhookId),
		index("webhook_event_subscription_idx_event_id").on(table.eventId),
		index("webhook_event_subscription_idx_is_enabled").on(table.isEnabled),
		index("webhook_event_subscription_idx_webhook_enabled").on(
			table.webhookId,
			table.isEnabled,
		),
	],
);

export const webhookDelivery = pgTable(
	"webhook_delivery",
	{
		id: text("id")
			.$defaultFn(() => createWebhookDeliveryId())
			.primaryKey(),
		webhookId: text("webhook_id")
			.notNull()
			.references(() => webhook.id, { onDelete: "cascade" }),
		eventId: text("event_id")
			.notNull()
			.references(() => webhookEvent.id, { onDelete: "cascade" }),
		eventData: jsonb("event_data").$type<Record<string, unknown>>().notNull(),
		status: webhookDeliveryStatusEnum("status").notNull().default("pending"),
		requestUrl: text("request_url").notNull(),
		requestHeaders: jsonb("request_headers").$type<Record<string, string>>(),
		requestBody: jsonb("request_body").$type<Record<string, unknown>>(),
		responseStatus: integer("response_status"),
		responseBody: text("response_body"),
		responseHeaders: jsonb("response_headers").$type<Record<string, string>>(),
		attemptNumber: integer("attempt_number").notNull().default(1),
		maxAttempts: integer("max_attempts").notNull().default(3),
		nextRetryAt: timestamp("next_retry_at"),
		lastAttemptAt: timestamp("last_attempt_at"),
		errorMessage: text("error_message"),
		errorDetails: jsonb("error_details").$type<Record<string, unknown>>(),
		completedAt: timestamp("completed_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("webhook_delivery_idx_webhook_id").on(table.webhookId),
		index("webhook_delivery_idx_status").on(table.status),
		index("webhook_delivery_idx_event_id").on(table.eventId),
		index("webhook_delivery_idx_created_at").on(table.createdAt),
		index("webhook_delivery_idx_next_retry_at").on(table.nextRetryAt),
		index("webhook_delivery_idx_webhook_status").on(
			table.webhookId,
			table.status,
		),
		index("webhook_delivery_idx_webhook_created").on(
			table.webhookId,
			table.createdAt,
		),
		index("webhook_delivery_idx_retry_pending").on(
			table.status,
			table.nextRetryAt,
		),
	],
);

export const webhookEventRelations = relations(webhookEvent, ({ many }) => ({
	subscriptions: many(webhookEventSubscription),
	deliveries: many(webhookDelivery),
}));

export const webhookRelations = relations(webhook, ({ one, many }) => ({
	organization: one(organization, {
		fields: [webhook.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [webhook.userId],
		references: [user.id],
	}),
	subscriptions: many(webhookEventSubscription),
	deliveries: many(webhookDelivery),
}));

export const webhookEventSubscriptionRelations = relations(
	webhookEventSubscription,
	({ one }) => ({
		webhook: one(webhook, {
			fields: [webhookEventSubscription.webhookId],
			references: [webhook.id],
		}),
		event: one(webhookEvent, {
			fields: [webhookEventSubscription.eventId],
			references: [webhookEvent.id],
		}),
	}),
);

export const webhookDeliveryRelations = relations(
	webhookDelivery,
	({ one }) => ({
		webhook: one(webhook, {
			fields: [webhookDelivery.webhookId],
			references: [webhook.id],
		}),
		event: one(webhookEvent, {
			fields: [webhookDelivery.eventId],
			references: [webhookEvent.id],
		}),
	}),
);

export const webhookTables = {
	webhookEvent,
	webhook,
	webhookEventSubscription,
	webhookDelivery,
} as const;

export type WebhookTable = typeof webhookTables;
