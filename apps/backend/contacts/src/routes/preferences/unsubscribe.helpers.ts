import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export type UnsubscribeMainResult =
	| { found: false }
	| { found: true; changed: boolean };

/**
 * Set the contact's top-level list status to unsubscribed.
 * Does not touch channel enrollments.
 */
export async function unsubscribeMainList(params: {
	contactId: string;
	organizationId: string;
}): Promise<UnsubscribeMainResult> {
	const log = useLogger();
	const { contactId, organizationId } = params;

	const contact = await db.query.contact.findFirst({
		where: and(
			eq(schema.contact.id, contactId),
			eq(schema.contact.organizationId, organizationId),
			isNull(schema.contact.deletedAt),
		),
	});

	if (!contact) return { found: false };

	if (contact.status === "unsubscribed") {
		return { found: true, changed: false };
	}

	await db
		.update(schema.contact)
		.set({ status: "unsubscribed", updatedAt: new Date() })
		.where(
			and(
				eq(schema.contact.id, contactId),
				eq(schema.contact.organizationId, organizationId),
				isNull(schema.contact.deletedAt),
			),
		);

	const lifecyclePayload = {
		organizationId,
		contactId: contact.id,
		email: contact.email,
		firstName: contact.firstName,
		lastName: contact.lastName,
		status: "unsubscribed",
	};

	await bus.publish(BusEvent.CONTACT_UPDATED, lifecyclePayload).catch((err) => {
		log.error("Failed to publish CONTACT_UPDATED", {
			contactId,
			error: err instanceof Error ? err.message : String(err),
		});
	});
	await bus
		.publish(BusEvent.CONTACT_UNSUBSCRIBED, lifecyclePayload)
		.catch((err) => {
			log.error("Failed to publish CONTACT_UNSUBSCRIBED", {
				contactId,
				error: err instanceof Error ? err.message : String(err),
			});
		});

	return { found: true, changed: true };
}

/** Unenroll every active channel subscription for this contact. */
export async function unenrollAllChannels(params: {
	contactId: string;
	organizationId: string;
}): Promise<number> {
	const { contactId, organizationId } = params;

	const enrollments = await db.query.channelSubscription.findMany({
		where: and(
			eq(schema.channelSubscription.contactId, contactId),
			eq(schema.channelSubscription.organizationId, organizationId),
			isNull(schema.channelSubscription.deletedAt),
		),
	});

	if (enrollments.length === 0) return 0;

	await db
		.update(schema.channelSubscription)
		.set({ status: "unenrolled", updatedAt: new Date() })
		.where(
			and(
				eq(schema.channelSubscription.contactId, contactId),
				eq(schema.channelSubscription.organizationId, organizationId),
				isNull(schema.channelSubscription.deletedAt),
			),
		);

	return enrollments.length;
}
