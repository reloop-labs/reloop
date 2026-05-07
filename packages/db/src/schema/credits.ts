import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	bigint,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";

// Custom ID generation functions with prefixes
const createCreditId = () => `crd_${createId()}`;
const createCreditTransactionId = () => `ctx_${createId()}`;

// Credits table - tracks current balance per organization
export const credits = pgTable(
	"credits",
	{
		id: text("id")
			.$defaultFn(() => createCreditId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.unique()
			.references(() => organization.id, { onDelete: "cascade" }),
		amount: bigint("amount", { mode: "number" }).notNull().default(0),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("credits_idx_organization_id").on(table.organizationId),
	],
);

// Credit Transactions table - logs every change to credits
export const creditTransactions = pgTable(
	"credit_transactions",
	{
		id: text("id")
			.$defaultFn(() => createCreditTransactionId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		amount: bigint("amount", { mode: "number" }).notNull(), // Positive for addition, negative for deduction
		type: text("type").notNull(), // 'usage', 'topup', 'bonus', 'initial'
		metadata: jsonb("metadata").$type<Record<string, any>>(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("credit_transactions_idx_organization_id").on(table.organizationId),
		index("credit_transactions_idx_type").on(table.type),
		index("credit_transactions_idx_created_at").on(table.createdAt),
	],
);

export const creditsRelations = relations(credits, ({ one }) => ({
	organization: one(organization, {
		fields: [credits.organizationId],
		references: [organization.id],
	}),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
	organization: one(organization, {
		fields: [creditTransactions.organizationId],
		references: [organization.id],
	}),
}));

export const creditsTables = {
	credits,
	creditTransactions,
} as const;

export type CreditsTable = typeof creditsTables;
