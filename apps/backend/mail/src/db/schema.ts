import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar, integer, text, serial } from "drizzle-orm/pg-core";


export const virtualDomains = pgTable("virtual_domains", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull().unique(),
});


export const virtualUsers = pgTable("virtual_users", {
	id: serial("id").primaryKey(),
	domainId: integer("domain_id").notNull().references(() => virtualDomains.id, { onDelete: "cascade" }),
	email: varchar("email", { length: 255 }).notNull().unique(),
	password: varchar("password", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const virtualAliases = pgTable("virtual_aliases", {
	id: serial("id").primaryKey(),
	domainId: integer("domain_id").notNull().references(() => virtualDomains.id, { onDelete: "cascade" }),
	source: varchar("source", { length: 255 }).notNull(),
	destination: text("destination").notNull(),
});


export const virtualDomainsRelations = relations(virtualDomains, ({ many }) => ({
	users: many(virtualUsers),
	aliases: many(virtualAliases),
}));

export const virtualUsersRelations = relations(virtualUsers, ({ one }) => ({
	domain: one(virtualDomains, {
		fields: [virtualUsers.domainId],
		references: [virtualDomains.id],
	}),
}));

export const virtualAliasesRelations = relations(virtualAliases, ({ one }) => ({
	domain: one(virtualDomains, {
		fields: [virtualAliases.domainId],
		references: [virtualDomains.id],
	}),
}));

// Legacy user table (keeping for compatibility)
export const user = pgTable("user", {
	id: varchar("id")
		.$defaultFn(() => createId())
		.primaryKey(),
	username: varchar("username").notNull().unique(),
	password: varchar("password").notNull(),
	email: varchar("email").notNull().unique(),
	salt: varchar("salt", { length: 64 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const table = {
	user,
	virtualDomains,
	virtualUsers,
	virtualAliases,
} as const;

export type Table = typeof table;
