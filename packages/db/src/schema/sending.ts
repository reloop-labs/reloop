import { createId } from "@paralleldrive/cuid2";
import { index, integer, pgEnum, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";

export const ipHealthEnum = pgEnum("sending_ip_health", ["ready", "warming", "paused", "blocklisted"]);

/** Egress IPs under engine management. Single row for self-host, N rows for hosted pools. */
export const sendingIp = pgTable(
	"sending_ip",
	{
		id: text("id").$defaultFn(() => `sip_${createId()}`).primaryKey(),
		address: text("address").notNull().unique(),
		pool: text("pool").notNull().default("default"),
		hostname: text("hostname").notNull().default(""),
		health: ipHealthEnum("health").notNull().default("warming"),
		warmupDay: integer("warmup_day").notNull().default(1),
		firstSeenAt: timestamp("first_seen_at").notNull().defaultNow(),
		reputationScore: integer("reputation_score").notNull().default(100),
		bounceRate: real("bounce_rate").notNull().default(0),
		complaintRate: real("complaint_rate").notNull().default(0),
		lastDnsblCheckAt: timestamp("last_dnsbl_check_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
	},
	(t) => [index("sending_ip_idx_pool").on(t.pool), index("sending_ip_idx_health").on(t.health)],
);

/** Daily per-(ip, provider) counters driving warmup quotas. */
export const warmupCounter = pgTable(
	"warmup_counter",
	{
		id: text("id").$defaultFn(() => `wuc_${createId()}`).primaryKey(),
		sendingIpId: text("sending_ip_id").notNull().references(() => sendingIp.id, { onDelete: "cascade" }),
		provider: text("provider").notNull(),
		day: text("day").notNull(), // YYYY-MM-DD UTC
		sentCount: integer("sent_count").notNull().default(0),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
	},
	(t) => [index("warmup_counter_idx_ip_day").on(t.sendingIpId, t.day)],
);

export const sendingTables = { sendingIp, warmupCounter } as const;
export type SendingTables = typeof sendingTables;
