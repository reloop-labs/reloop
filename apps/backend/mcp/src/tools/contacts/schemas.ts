import * as z from "zod";
import type { Contact } from "../../reloop/types";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PROPERTY_KEY_PATTERN = /^[a-z0-9_]+$/;

export const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
export const MAX_RECORD_KEYS = 100;

export const resourceIdSchema = z.string().min(1).max(128).regex(ID_PATTERN);

export const contactIdSchema = resourceIdSchema.describe(
	"Contact ID as returned by Reloop, for example con_123456789",
);

export function withinKeyLimit(record: Record<string, unknown>): boolean {
	return Object.keys(record).length <= MAX_RECORD_KEYS;
}

export const emailSchema = z
	.string()
	.trim()
	.min(3)
	.max(320)
	.regex(EMAIL_PATTERN)
	.describe("Email address");

export const contactStatusSchema = z.enum([
	"subscribed",
	"unsubscribed",
	"blocked",
]);

export const propertiesSchema = z
	.record(
		z.string().regex(PROPERTY_KEY_PATTERN).max(64),
		z.union([z.string().max(2000), z.number()]),
	)
	.refine(withinKeyLimit, {
		message: `at most ${MAX_RECORD_KEYS} properties per contact`,
	})
	.describe(
		"Custom contact properties as key/value pairs. Keys are lowercase letters, digits, and underscores.",
	);

export const contactSchema = z.object({
	id: z.string(),
	email: z.string(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	status: contactStatusSchema,
	properties: z.record(z.string(), z.union([z.string(), z.number()])),
	groups: z.array(z.object({ id: z.string(), name: z.string() })),
	channels: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			subscription: z.enum(["opt_in", "opt_out"]),
		}),
	),
	suppressionReason: z.enum(["hard_bounce", "spam_complaint"]).nullable(),
	suppressedAt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type ContactOutput = z.output<typeof contactSchema>;

export function toContactOutput(contact: Contact): ContactOutput {
	return {
		id: contact.id,
		email: contact.email,
		firstName: contact.firstName,
		lastName: contact.lastName,
		status: contact.status,
		properties: contact.properties,
		groups: contact.groups.map((group) => ({ id: group.id, name: group.name })),
		channels: contact.channels.map((channel) => ({
			id: channel.id,
			name: channel.name,
			subscription: channel.subscription,
		})),
		suppressionReason: contact.suppressionReason,
		suppressedAt: contact.suppressedAt,
		createdAt: contact.createdAt,
		updatedAt: contact.updatedAt,
	};
}
