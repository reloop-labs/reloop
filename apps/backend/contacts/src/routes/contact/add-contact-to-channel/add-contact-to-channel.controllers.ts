import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { log } from "evlog";
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
	const logger = useLogger();

	if (!contact_id && !email) {
		throw status(400, {
			message: "Either 'contact_id' or 'email' must be provided",
		});
	}

	try {
		// Verify channel exists
		const channel = await db.query.channel.findFirst({
			where: and(
				eq(schema.channel.id, channelId),
				eq(schema.channel.organizationId, organizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		if (!channel) {
			throw status(404, { message: "Channel not found" });
		}

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
			logger?.info("Contact not found", { contact_id, email });
			throw status(404, { message: "Contact not found" });
		}

		logger?.info("Checking if contact is already subscribed to channel", {
			contactId: contact.id,
			channelId,
		});
		const existingSubscription = await db.query.channelSubscription.findFirst({
			where: and(
				eq(schema.channelSubscription.contactId, contact.id),
				eq(schema.channelSubscription.channelId, channelId),
				isNull(schema.channelSubscription.deletedAt),
			),
		});

		const targetStatus = (
			subscription === "opt_out" ? "unenrolled" : "enrolled"
		) as "enrolled" | "unenrolled";

		if (existingSubscription) {
			// If status is different, update it
			if (existingSubscription.status !== targetStatus) {
				await db
					.update(schema.channelSubscription)
					.set({ status: targetStatus, updatedAt: new Date() })
					.where(eq(schema.channelSubscription.id, existingSubscription.id));

				logger?.info("Updated contact subscription status", {
					subscriptionId: existingSubscription.id,
					currentStatus: targetStatus,
				});

				const result = {
					contact,
					subscriptionId: existingSubscription.id,
					event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
				};

				return result;
			}

			throw status(409, {
				message: `Contact is already ${existingSubscription.status} in this channel`,
			});
		}
		// Create subscription
		const [newSubscription] = await db
			.insert(schema.channelSubscription)
			.values({
				contactId: contact.id,
				channelId,
				organizationId,
				status: targetStatus,
			})
			.returning();

		if (!newSubscription) {
			throw new Error("Failed to create subscription");
		}

		logger?.info("Contact added to channel successfully", {
			contactId: contact.id,
			subscriptionId: newSubscription.id,
			currentStatus: targetStatus,
		});

		const result = {
			contact,
			subscriptionId: newSubscription.id,
			event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error({
			message: "Error adding contact to channel",
			contactId: contact_id,
			email: email?.toLowerCase(),
			channelId,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
