import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

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
} as const;

export type Table = typeof table;
