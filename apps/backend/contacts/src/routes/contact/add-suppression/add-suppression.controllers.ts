import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { ContactModel } from "@be/contacts/model/contact.model";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function addSuppressionController({
	organizationId,
	userId,
	email: rawEmail,
	reason,
}: {
	organizationId: string;
	userId: string;
} & ContactModel.AddSuppressionBody): Promise<ContactModel.SuppressionResponse> {
	const log = useLogger();
	// The send-time check (step-2b-check-suppressions) matches lowercased addresses
	const email = rawEmail.trim().toLowerCase();
	const note = reason.trim();

	try {
		const { contact, created } = await db.transaction(async (tx) => {
			const rows = await tx
				.select()
				.from(schema.contact)
				.where(
					and(
						eq(schema.contact.email, email),
						eq(schema.contact.organizationId, organizationId),
					),
				)
				.limit(2);
			const active = rows.find((r) => r.deletedAt === null) ?? null;
			const softDeleted = rows.find((r) => r.deletedAt !== null) ?? null;

			if (active && (active.status === "blocked" || active.suppressionReason)) {
				throw ContactErrors.alreadySuppressed(email);
			}

			const now = new Date();
			// Manual suppressions never carry a suppressionReason: that field marks
			// system suppressions, which also apply to other organizations.
			const suppression = {
				status: "blocked" as const,
				suppressionReason: null,
				suppressedAt: now,
				suppressionNote: note,
				updatedAt: now,
			};

			const existing = active ?? softDeleted;
			if (existing) {
				const [updated] = await tx
					.update(schema.contact)
					.set({ ...suppression, deletedAt: null })
					.where(eq(schema.contact.id, existing.id))
					.returning();
				if (!updated) throw ContactErrors.createFailed();
				return { contact: updated, created: !active };
			}

			const [inserted] = await tx
				.insert(schema.contact)
				.values({ ...suppression, email, organizationId, userId })
				.returning();
			if (!inserted) throw ContactErrors.createFailed();
			return { contact: inserted, created: true };
		});

		log.info("Contact suppressed manually", {
			contactId: contact.id,
			organizationId,
			created,
		});

		const lifecyclePayload = {
			organizationId,
			contactId: contact.id,
			email: contact.email,
			firstName: contact.firstName,
			lastName: contact.lastName,
			status: contact.status,
		};
		const events = created
			? [BusEvent.CONTACT_CREATED, BusEvent.CONTACT_BLOCKED]
			: [BusEvent.CONTACT_UPDATED, BusEvent.CONTACT_BLOCKED];
		for (const event of events) {
			await bus.publish(event, lifecyclePayload).catch((err) => {
				log.error("Failed to publish contact event", {
					contactId: contact.id,
					event,
					error: err instanceof Error ? err.message : String(err),
				});
			});
		}

		return {
			object: "suppression",
			contactId: contact.id,
			email: contact.email,
			suppressionSource: "manual",
			suppressionNote: note,
			suppressedAt: contact.suppressedAt ?? new Date(),
		};
	} catch (error) {
		log.error("Error adding suppression", {
			organizationId,
			error: error instanceof Error ? error.message : String(error),
		});
		if (isAppError(error)) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
