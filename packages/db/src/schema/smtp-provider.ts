import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { domain } from "./domain";

const createSmtpProviderId = () => `smtp_${createId()}`;

// No implicit TLS (465): KumoMTA egress only speaks STARTTLS.
export const smtpSecurityEnum = pgEnum("smtp_security", ["starttls", "none"]);
export const smtpProviderStatusEnum = pgEnum("smtp_provider_status", [
	"unverified",
	"ok",
	"failing",
]);

export type SmtpSecurity = (typeof smtpSecurityEnum.enumValues)[number];
export type SmtpProviderStatus =
	(typeof smtpProviderStatusEnum.enumValues)[number];

/**
 * Customer-owned SMTP relay ("bring your own SMTP"). Domains that point at a
 * provider are relayed by KumoMTA through this host instead of direct-to-MX.
 * `passwordEnc` is always written with `encryptSecretStrict`.
 */
export const smtpProvider = pgTable(
	"smtp_provider",
	{
		id: text("id").$defaultFn(createSmtpProviderId).primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 100 }).notNull(),
		host: varchar("host", { length: 255 }).notNull(),
		port: integer("port").notNull(),
		security: smtpSecurityEnum("security").notNull().default("starttls"),
		username: varchar("username", { length: 255 }),
		passwordEnc: text("password_enc"),
		status: smtpProviderStatusEnum("status").notNull().default("unverified"),
		lastTestedAt: timestamp("last_tested_at"),
		lastError: text("last_error"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [index("smtp_provider_org_idx").on(t.organizationId)],
);

export const smtpProviderRelations = relations(
	smtpProvider,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [smtpProvider.organizationId],
			references: [organization.id],
		}),
		domains: many(domain),
	}),
);
