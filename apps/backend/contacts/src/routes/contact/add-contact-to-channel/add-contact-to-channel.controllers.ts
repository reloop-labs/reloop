import {
	ChannelErrors,
	ContactErrors,
	isAppError,
	SubscriptionErrors,
} from "@be/contacts/error/contacts.error-response";
import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export interface AddContactToChannelResult {
	contact: {
		id: string;
		email: string;
		status: string;
		organizationId: string;
		createdAt: Date;
		updatedAt: Date;
		deletedAt: Date | null;
	};
	subscriptionId: string;
	event: string;
}

export async function addContactToChannelController({
	organizationId,
	channelId,
	subscription,
	contact_id,
	email,
}: {
	organizationId: string;
	channelId: string;
} & ContactModel.AddContactToChannelBody): Promise<AddContactToChannelResult> {
	const log = useLogger();

	if (!contact_id && !email) {
		throw ContactErrors.invalidEmail(
			"",
			"Either 'contact_id' or 'email' must be provided",
		);
	}

	try {
		const channel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channelId),
				eq(schema.channel.organizationId, organizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!channel) {
			throw ChannelErrors.notFound(channelId);
		}

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
			const emailLower = email.toLowerCase();
			contact = await db.query.contact.findFirst({
				where: and(
					eq(schema.contact.email, emailLower),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			});
		}

		if (!contact) {
			log.info("Contact not found", { contact_id, email });
			throw ContactErrors.contactNotFound(contact_id || email || "");
		}

		log.info("Checking if contact is already subscribed to channel", {
			contactId: contact.id,
			channelId,
		});
		// Include soft-deleted rows so we restore instead of INSERT → unique conflict.
		const existingSubscription = await db.query.channelSubscription.findFirst({
			where: and(
				eq(schema.channelSubscription.contactId, contact.id),
				eq(schema.channelSubscription.channelId, channelId),
			),
		});

		const targetStatus = (
			subscription === "opt_out" ? "unenrolled" : "enrolled"
		) as "enrolled" | "unenrolled";

		if (existingSubscription) {
			const isActive = existingSubscription.deletedAt === null;
			if (isActive && existingSubscription.status === targetStatus) {
				throw SubscriptionErrors.alreadyExists();
			}

			await db
				.update(schema.channelSubscription)
				.set({
					status: targetStatus,
					deletedAt: null,
					updatedAt: new Date(),
				})
				.where(eq(schema.channelSubscription.id, existingSubscription.id));

			log.info(
				isActive
					? "Updated contact subscription status"
					: "Restored soft-deleted contact subscription",
				{
					subscriptionId: existingSubscription.id,
					currentStatus: targetStatus,
				},
			);

			return {
				contact,
				subscriptionId: existingSubscription.id,
				event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
			};
		}

		const [newSubscription] = await db
			.insert(schema.channelSubscription)
			.values({
				contactId: contact.id,
				channelId,
				organizationId,
				status: targetStatus,
			})
			.onConflictDoUpdate({
				target: [
					schema.channelSubscription.contactId,
					schema.channelSubscription.channelId,
				],
				set: {
					status: targetStatus,
					deletedAt: null,
					updatedAt: new Date(),
				},
			})
			.returning();

		if (!newSubscription) {
			throw ContactErrors.createFailed("Failed to create subscription");
		}

		log.info("Contact added to channel successfully", {
			contactId: contact.id,
			subscriptionId: newSubscription.id,
			currentStatus: targetStatus,
		});

		return {
			contact,
			subscriptionId: newSubscription.id,
			event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error("Error adding contact to channel", {
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
