import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

export type ResolvedContact = typeof schema.contact.$inferSelect;

export type ResolveContactResult =
	| { ok: true; contact: ResolvedContact; created: boolean }
	| { ok: false; reason: "contact_required" | "contact_not_found" };

/**
 * Resolve a contact for enrollment.
 * Looks up by contactId, or by email (creating / restoring if missing).
 */
export async function resolveOrCreateContact(params: {
	organizationId: string;
	userId: string;
	contactId?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
}): Promise<ResolveContactResult> {
	const contactId = params.contactId?.trim();
	const email = params.email?.trim().toLowerCase();

	if (!contactId && !email) {
		return { ok: false, reason: "contact_required" };
	}

	if (contactId) {
		const contact = await db.query.contact.findFirst({
			where: and(
				eq(schema.contact.id, contactId),
				eq(schema.contact.organizationId, params.organizationId),
				isNull(schema.contact.deletedAt),
			),
		});
		if (!contact) return { ok: false, reason: "contact_not_found" };
		return { ok: true, contact, created: false };
	}

	if (!email) {
		return { ok: false, reason: "contact_required" };
	}

	return lookupOrCreateByEmail({
		organizationId: params.organizationId,
		userId: params.userId,
		email,
		firstName: params.firstName,
		lastName: params.lastName,
	});
}

async function lookupOrCreateByEmail(params: {
	organizationId: string;
	userId: string;
	email: string;
	firstName?: string;
	lastName?: string;
}): Promise<ResolveContactResult> {
	const existing = await db.query.contact.findFirst({
		where: and(
			eq(schema.contact.email, params.email),
			eq(schema.contact.organizationId, params.organizationId),
		),
	});

	if (existing && !existing.deletedAt) {
		return { ok: true, contact: existing, created: false };
	}

	if (existing?.deletedAt) {
		const [restored] = await db
			.update(schema.contact)
			.set({
				deletedAt: null,
				firstName: params.firstName?.trim() || existing.firstName,
				lastName: params.lastName?.trim() || existing.lastName,
				updatedAt: new Date(),
			})
			.where(eq(schema.contact.id, existing.id))
			.returning();
		if (!restored) return { ok: false, reason: "contact_not_found" };
		await publishCreated(restored);
		return { ok: true, contact: restored, created: true };
	}

	try {
		const [created] = await db
			.insert(schema.contact)
			.values({
				email: params.email,
				firstName: params.firstName?.trim() || null,
				lastName: params.lastName?.trim() || null,
				status: "subscribed",
				organizationId: params.organizationId,
				userId: params.userId,
			})
			.returning();
		if (!created) return { ok: false, reason: "contact_not_found" };
		await publishCreated(created);
		return { ok: true, contact: created, created: true };
	} catch (error) {
		if (isUniqueViolation(error)) {
			const raced = await db.query.contact.findFirst({
				where: and(
					eq(schema.contact.email, params.email),
					eq(schema.contact.organizationId, params.organizationId),
				),
			});
			if (raced && !raced.deletedAt) {
				return { ok: true, contact: raced, created: false };
			}
		}
		throw error;
	}
}

async function publishCreated(contact: ResolvedContact): Promise<void> {
	await bus
		.publish(BusEvent.CONTACT_CREATED, {
			organizationId: contact.organizationId,
			contactId: contact.id,
			email: contact.email,
			firstName: contact.firstName,
			lastName: contact.lastName,
			status: contact.status,
		})
		.catch((err) => {
			log.error({
				message: "Failed to publish CONTACT_CREATED from automation enroll",
				contactId: contact.id,
				error: err instanceof Error ? err.message : String(err),
			});
		});
}

function isUniqueViolation(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code: string }).code === "23505"
	);
}
