import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	index,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { apikey } from "./api-key";
import { organization } from "./auth";
import { domain } from "./domain";

// Optional address restrictions for an API key. The apikey table itself is
// owned by Better Auth and is not modified; a key with no rows here keeps full
// access. Each row allows one domain, either every address on it (email null)
// or one specific address.

const createApiKeyScopeId = () => `aks_${createId()}`;

export const apiKeyScope = pgTable(
	"api_key_scope",
	{
		id: text("id")
			.$defaultFn(() => createApiKeyScopeId())
			.primaryKey(),
		apiKeyId: text("api_key_id")
			.notNull()
			.references(() => apikey.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		domainId: text("domain_id")
			.notNull()
			.references(() => domain.id, { onDelete: "cascade" }),
		/** Lowercased address on that domain; null allows every address on it. */
		email: varchar("email", { length: 255 }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("api_key_scope_idx_api_key_id").on(table.apiKeyId),
		unique("api_key_scope_unique_entry")
			.on(table.apiKeyId, table.domainId, table.email)
			.nullsNotDistinct(),
	],
);

export const apiKeyScopeRelations = relations(apiKeyScope, ({ one }) => ({
	apiKey: one(apikey, {
		fields: [apiKeyScope.apiKeyId],
		references: [apikey.id],
	}),
	domain: one(domain, {
		fields: [apiKeyScope.domainId],
		references: [domain.id],
	}),
}));
