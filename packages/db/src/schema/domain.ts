import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

// Custom ID generation functions with prefixes
const createDomainId = () => `domain_${createId()}`;
const createDnsRecordId = () => `dns_${createId()}`;

export const domainTypeEnum = pgEnum("domain_type", [
	"custom",
	"subdomain",
	"system",
]);
export const domainStatusEnum = pgEnum("domain_status", [
	"start-verify",
	"verifying",
	"active",
	"suspended",
	"failed",
]);
export const dnsRecordTypeEnum = pgEnum("dns_record_type", [
	"A",
	"AAAA",
	"CNAME",
	"MX",
	"TXT",
]);

export const dnsRecordTypeNameEnum = pgEnum("dns_record_type_name", [
	"MX",
	"SPF",
	"DKIM",
	"DMARC",
]);

export const domain = pgTable(
	"domain",
	{
		id: text("id")
			.$defaultFn(() => createDomainId())
			.primaryKey(),
		domain: varchar("domain", { length: 255 }).notNull(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		domainType: domainTypeEnum("domain_type").notNull().default("custom"),
		status: domainStatusEnum("status").notNull().default("start-verify"),
		userVerified: boolean("user_verified").notNull().default(false),
		systemVerified: boolean("system_verified").notNull().default(false),
		trackingDomain: boolean("tracking_domain").notNull().default(false),
		verificationFailedReason: text("verification_failed_reason"),
		deletedAt: timestamp("deleted_at"),
		lastVerifiedAt: timestamp("last_verified_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("domain_idx_domain").on(table.domain),
		index("domain_idx_user_id").on(table.userId),
		index("domain_idx_organization_id").on(table.organizationId),
		index("domain_idx_status").on(table.status),
		index("domain_idx_user_verified").on(table.userVerified),
		index("domain_idx_system_verified").on(table.systemVerified),
		index("domain_idx_created_at").on(table.createdAt),
		index("domain_idx_deleted_at").on(table.deletedAt),
		index("domain_idx_last_verified_at").on(table.lastVerifiedAt),
		index("domain_idx_org_status").on(table.organizationId, table.status),
		index("domain_idx_org_deleted").on(table.organizationId, table.deletedAt),
		index("domain_idx_user_status").on(table.userId, table.status),
		index("domain_idx_status_verified").on(table.status, table.userVerified),
		unique("domain_unique_org_domain").on(table.organizationId, table.domain),
	],
);

export const domainDnsRecord = pgTable(
	"domain_dns_record",
	{
		id: text("id")
			.$defaultFn(() => createDnsRecordId())
			.primaryKey(),
		domainId: text("domain_id")
			.notNull()
			.references(() => domain.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		recordType: dnsRecordTypeEnum("record_type").notNull(),
		name: text("name").notNull(),
		status: domainStatusEnum("status").notNull().default("start-verify"),
		value: text("value").notNull(),
		ttl: text("ttl").notNull().default("Auto"),
		priority: integer("priority"),
		recordTypeName: dnsRecordTypeNameEnum("record_type_name").notNull(),
		domain: text("domain").notNull(),
		privateKey: text("private_key"),
		verificationError: text("verification_error"),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("domain_dns_record_idx_domain_id").on(table.domainId),
		index("domain_dns_record_idx_record_type").on(table.recordType),
		index("domain_dns_record_idx_name").on(table.name),
		index("domain_dns_record_idx_deleted_at").on(table.deletedAt),
		index("domain_dns_record_idx_domain_type").on(
			table.domainId,
			table.recordType,
		),
		unique("domain_dns_record_unique_record").on(
			table.domainId,
			table.recordType,
			table.name,
			table.value,
		),
	],
);

export const domainRelations = relations(domain, ({ many, one }) => ({
	organization: one(organization, {
		fields: [domain.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [domain.userId],
		references: [user.id],
	}),
	dnsRecords: many(domainDnsRecord),
}));

export const domainDnsRecordRelations = relations(
	domainDnsRecord,
	({ one }) => ({
		domain: one(domain, {
			fields: [domainDnsRecord.domainId],
			references: [domain.id],
		}),
		organization: one(organization, {
			fields: [domainDnsRecord.organizationId],
			references: [organization.id],
		}),
		user: one(user, {
			fields: [domainDnsRecord.userId],
			references: [user.id],
		}),
	}),
);

export const domainTables = {
	domain,
	domainDnsRecord,
} as const;

export type DomainTable = typeof domainTables;
