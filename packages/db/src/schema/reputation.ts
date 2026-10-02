import { createId } from "@paralleldrive/cuid2";
import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { domain } from "./domain";

export const sendingBlockReasonEnum = pgEnum("sending_block_reason", [
	"bounce_rate",
	"complaint_rate",
	"duplicate_burst",
]);

export const sendingBlockWindowEnum = pgEnum("sending_block_window", [
	"24h",
	"7d",
]);

const createBlockId = () => `blk_${createId()}`;

/**
 * org_sending_block — reputation auto-block ledger.
 *
 * One row per enforcement action. The send pipeline blocks when a row exists
 * with releasedAt IS NULL and expiresAt > now for the org (or org+domain).
 * Expired / released rows are history for admin appeal + escalation.
 */
export const orgSendingBlock = pgTable(
	"org_sending_block",
	{
		id: text("id")
			.$defaultFn(() => createBlockId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		domainId: text("domain_id").references(() => domain.id, {
			onDelete: "cascade",
		}),
		reason: sendingBlockReasonEnum("reason").notNull(),
		window: sendingBlockWindowEnum("window").notNull().default("24h"),
		sentCount: integer("sent_count").notNull().default(0),
		bouncedCount: integer("bounced_count").notNull().default(0),
		complaintCount: integer("complaint_count").notNull().default(0),
		bounceRate: real("bounce_rate").notNull().default(0),
		complaintRate: real("complaint_rate").notNull().default(0),
		blockedAt: timestamp("blocked_at").notNull().defaultNow(),
		expiresAt: timestamp("expires_at").notNull(),
		notifiedAt: timestamp("notified_at"),
		releasedAt: timestamp("released_at"),
		metadata: jsonb("metadata").$type<Record<string, unknown>>(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("org_sending_block_idx_org").on(table.organizationId),
		index("org_sending_block_idx_org_expires").on(
			table.organizationId,
			table.expiresAt,
		),
		index("org_sending_block_idx_domain").on(table.domainId),
	],
);

export type OrgSendingBlock = typeof orgSendingBlock.$inferSelect;
export type NewOrgSendingBlock = typeof orgSendingBlock.$inferInsert;
