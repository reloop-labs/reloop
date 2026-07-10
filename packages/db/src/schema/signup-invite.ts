import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

/** Platform signup invite (gates account creation). Distinct from org `invitation`. */
export const signupInviteStatusEnum = pgEnum("signup_invite_status", [
	"pending",
	"used",
	"revoked",
]);

const createSignupInviteId = () => `sinv_${createId()}`;
const createSignupInviteCode = () => `rl_inv_${createId()}`;

export const signupInvite = pgTable(
	"signup_invite",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createSignupInviteId()),
		code: text("code")
			.notNull()
			.unique()
			.$defaultFn(() => createSignupInviteCode()),
		email: text("email").notNull(),
		status: signupInviteStatusEnum("status").notNull().default("pending"),
		expiresAt: timestamp("expires_at").notNull(),
		invitedByUserId: text("invited_by_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		usedByUserId: text("used_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("signup_invite_email_idx").on(table.email),
		index("signup_invite_invited_by_idx").on(table.invitedByUserId),
		index("signup_invite_status_idx").on(table.status),
	],
);

export const signupInviteRelations = relations(signupInvite, ({ one }) => ({
	invitedBy: one(user, {
		fields: [signupInvite.invitedByUserId],
		references: [user.id],
		relationName: "signupInvitesSent",
	}),
	usedBy: one(user, {
		fields: [signupInvite.usedByUserId],
		references: [user.id],
		relationName: "signupInvitesUsed",
	}),
}));
