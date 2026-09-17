import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

export const sendingIpKindEnum = pgEnum("sending_ip_kind", [
	"shared",
	"dedicated",
]);
export const sendingIpStatusEnum = pgEnum("sending_ip_status", [
	"active",
	"disabled",
	"retired",
]);
export const ipWarmupStatusEnum = pgEnum("ip_warmup_status", [
	"pending",
	"active",
	"paused",
	"completed",
	"aborted",
]);
export const ipWarmupOverflowEnum = pgEnum("ip_warmup_overflow", [
	"shared",
	"defer",
]);

export type SendingIpKind = (typeof sendingIpKindEnum.enumValues)[number];
export type SendingIpStatus = (typeof sendingIpStatusEnum.enumValues)[number];
export type IpWarmupStatus = (typeof ipWarmupStatusEnum.enumValues)[number];
export type IpWarmupOverflow = (typeof ipWarmupOverflowEnum.enumValues)[number];

export const MAILBOX_PROVIDERS = [
	"gmail",
	"microsoft",
	"yahoo",
	"apple",
	"other",
] as const;
export type MailboxProvider = (typeof MAILBOX_PROVIDERS)[number];
export type ProviderSendCounts = Record<MailboxProvider, number>;

export type WarmupPhase = {
	startDay: number;
	endDay: number;
	dailyCap: number;
	providers: ProviderSendCounts;
};

const createSendingIpId = () => `sip_${createId()}`;
const createOrganizationSendingIpId = () => `osi_${createId()}`;
const createIpWarmupId = () => `ipw_${createId()}`;

export const sendingIp = pgTable(
	"sending_ip",
	{
		id: text("id").$defaultFn(createSendingIpId).primaryKey(),
		address: varchar("address", { length: 45 }).notNull(),
		hostname: varchar("hostname", { length: 255 }).notNull(),
		kind: sendingIpKindEnum("kind").notNull(),
		status: sendingIpStatusEnum("status").notNull().default("active"),
		notes: text("notes"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		uniqueIndex("sending_ip_address_idx").on(t.address),
		index("sending_ip_kind_idx").on(t.kind),
		index("sending_ip_status_idx").on(t.status),
	],
);

export const organizationSendingIp = pgTable(
	"organization_sending_ip",
	{
		id: text("id").$defaultFn(createOrganizationSendingIpId).primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		sendingIpId: text("sending_ip_id")
			.notNull()
			.references(() => sendingIp.id, { onDelete: "restrict" }),
		assignedByUserId: text("assigned_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		isPrimary: boolean("is_primary").notNull().default(false),
		assignedAt: timestamp("assigned_at").notNull().defaultNow(),
		unassignedAt: timestamp("unassigned_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		uniqueIndex("organization_sending_ip_active_ip_idx")
			.on(t.sendingIpId)
			.where(sql`${t.unassignedAt} is null`),
		uniqueIndex("organization_sending_ip_primary_org_idx")
			.on(t.organizationId)
			.where(sql`${t.unassignedAt} is null AND ${t.isPrimary} = true`),
		index("organization_sending_ip_org_idx").on(t.organizationId),
		index("organization_sending_ip_ip_idx").on(t.sendingIpId),
	],
);

export const ipWarmup = pgTable(
	"ip_warmup",
	{
		id: text("id").$defaultFn(createIpWarmupId).primaryKey(),
		organizationSendingIpId: text("organization_sending_ip_id")
			.notNull()
			.references(() => organizationSendingIp.id, { onDelete: "cascade" }),
		sendingIpId: text("sending_ip_id")
			.notNull()
			.references(() => sendingIp.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		status: ipWarmupStatusEnum("status").notNull().default("pending"),
		overflow: ipWarmupOverflowEnum("overflow").notNull().default("shared"),
		schedule: jsonb("schedule").$type<WarmupPhase[]>().notNull(),
		startedAt: timestamp("started_at"),
		completedAt: timestamp("completed_at"),
		pausedAt: timestamp("paused_at"),
		sentTodayByProvider: jsonb("sent_today_by_provider")
			.$type<ProviderSendCounts>()
			.notNull()
			.default(sql`'{}'::jsonb`),
		dailyWindowStart: timestamp("daily_window_start").notNull().defaultNow(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		uniqueIndex("ip_warmup_assignment_idx").on(t.organizationSendingIpId),
		index("ip_warmup_org_idx").on(t.organizationId),
		index("ip_warmup_ip_idx").on(t.sendingIpId),
		index("ip_warmup_status_idx").on(t.status),
	],
);

export const sendingIpRelations = relations(sendingIp, ({ many }) => ({
	assignments: many(organizationSendingIp),
	warmups: many(ipWarmup),
}));

export const organizationSendingIpRelations = relations(
	organizationSendingIp,
	({ one }) => ({
		organization: one(organization, {
			fields: [organizationSendingIp.organizationId],
			references: [organization.id],
		}),
		sendingIp: one(sendingIp, {
			fields: [organizationSendingIp.sendingIpId],
			references: [sendingIp.id],
		}),
		assignedBy: one(user, {
			fields: [organizationSendingIp.assignedByUserId],
			references: [user.id],
		}),
		warmup: one(ipWarmup, {
			fields: [organizationSendingIp.id],
			references: [ipWarmup.organizationSendingIpId],
		}),
	}),
);

export const ipWarmupRelations = relations(ipWarmup, ({ one }) => ({
	assignment: one(organizationSendingIp, {
		fields: [ipWarmup.organizationSendingIpId],
		references: [organizationSendingIp.id],
	}),
	sendingIp: one(sendingIp, {
		fields: [ipWarmup.sendingIpId],
		references: [sendingIp.id],
	}),
	organization: one(organization, {
		fields: [ipWarmup.organizationId],
		references: [organization.id],
	}),
}));
