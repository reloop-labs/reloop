import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function updateContactChannelController({
	organizationId,
	channelId,
	contact_id,
	email,
	subscription,
}: {
	organizationId: string;
	channelId: string;
} & ContactModel.UpdateContactChannelBody): Promise<ContactModel.UpdateContactChannelResponse> {
	const log = useLogger();

	if (!contact_id && !email) {
		throw ContactErrors.invalidEmail(
			"",
			"Either 'contact_id' or 'email' must be provided",
		);
	}

	log.info("Updating contact channel status", {
		contactId: contact_id,
		email: email?.toLowerCase(),
		channelId,
		subscription,
	});

	try {
		// Identify contact
		let contact: typeof schema.contact.$inferSelect | undefined;

		if (contact_id) {
			contact = await db.query.contact.findFirst({
				where: and(
					eq(schema.contact.id, contact_id),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			});
		} else if (email) {
			contact = await db.query.contact.findFirst({
				where: and(
					eq(schema.contact.email, email.toLowerCase()),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			});
		}

		if (!contact) {
			log.info("Contact not found", { contact_id, email });
			throw ContactErrors.contactNotFound(contact_id || email || "");
		}

		const targetStatus = (
			subscription === "opt_out" ? "unenrolled" : "enrolled"
		) as "enrolled" | "unenrolled";

		log.info("Checking existing channel enrollment", {
			contactId: contact.id,
			channelId,
		});
		const existing = await db.query.channelSubscription.findFirst({
			where: and(
				eq(schema.channelSubscription.contactId, contact.id),
				eq(schema.channelSubscription.channelId, channelId),
				eq(schema.channelSubscription.organizationId, organizationId),
				isNull(schema.channelSubscription.deletedAt),
			),
		});

		if (existing) {
			if (existing.status !== targetStatus) {
				await db
					.update(schema.channelSubscription)
					.set({ status: targetStatus, updatedAt: new Date() })
					.where(eq(schema.channelSubscription.id, existing.id));

				log.info("Updated contact subscription status", {
					subscriptionId: existing.id,
					currentStatus: targetStatus,
				});
			}
		} else {
			await db.insert(schema.channelSubscription).values({
				contactId: contact.id,
				channelId,
				organizationId,
				status: targetStatus,
			});

			log.info("Created new contact subscription", {
				contactId: contact.id,
				channelId,
				currentStatus: targetStatus,
			});
		}

		const result = {
			success: true,
			status: targetStatus,
			event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Error updating contact channel status", {
			contactId: contact_id,
			email: email?.toLowerCase(),
			channelId,
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
