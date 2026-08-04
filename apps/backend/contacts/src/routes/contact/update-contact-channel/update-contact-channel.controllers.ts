import {
	ChannelErrors,
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { ContactModel } from "@be/contacts/model/contact.model";
import {
	attachAuditChanges,
	type ContactFieldChange,
} from "@be/contacts/utils/contact-field-changes";
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

		const channel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channelId),
				eq(schema.channel.organizationId, organizationId),
			),
		});

		if (!channel) {
			throw ChannelErrors.notFound(channelId);
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

		const changes: ContactFieldChange[] = [];
		const channelLabel = channel.name;
		const subscriptionLabel = subscription ?? targetStatus;

		if (existing) {
			if (existing.status !== targetStatus) {
				await db
					.update(schema.channelSubscription)
					.set({ status: targetStatus, updatedAt: new Date() })
					.where(eq(schema.channelSubscription.id, existing.id));

				log.info("Updated contact subscription status", {
					subscriptionId: existing.id,
					from: existing.status,
					to: targetStatus,
				});

				// Keep channel name available for history copy via response metadata
				changes.push({
					field: "channel",
					from: channelLabel,
					to: channelLabel,
					label: "Channel",
				});
				// Real transition — previous status, not null
				changes.push({
					field: "channel_subscription",
					from: existing.status,
					to: subscriptionLabel,
					label: "Subscription",
				});
			}
			// Idempotent no-op when status already matches — no audit changes
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

			changes.push({
				field: "channel",
				from: null,
				to: channelLabel,
				label: "Channel",
			});
			changes.push({
				field: "channel_subscription",
				from: null,
				to: subscriptionLabel,
				label: "Subscription",
			});
		}

		const result = {
			success: true,
			id: contact.id,
			status: targetStatus,
			channelId,
			channelName: channel.name,
			subscription,
			event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
		};
		if (changes.length > 0) {
			attachAuditChanges(result, changes);
		}

		return result;
	} catch (error) {
		log.error("Error updating contact channel status", {
			contactId: contact_id,
			email: email?.toLowerCase(),
			channelId,
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
