import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function getContactController({
	contactId,
	organizationId,
}: {
	contactId: string;
	organizationId: string;
}): Promise<ContactTypes.ContactResponse> {
	const log = useLogger();
	log.info("Getting contact", { contactId, organizationId });

	try {
		// Fetch the contact (with its relations) and the full channel list in parallel —
		// allChannels only needs organizationId, so it doesn't depend on the contact result.
		const [contact, allChannels] = await Promise.all([
			db.query.contact.findFirst({
				where: and(
					eq(schema.contact.id, contactId),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
				with: {
					propertyValues: {
						with: { property: true },
						where: isNull(schema.contactPropertyValue.deletedAt),
					},
					contactGroups: {
						with: { group: true },
						where: isNull(schema.contactGroup.deletedAt),
					},
					contactChannels: {
						with: { channel: true },
						where: isNull(schema.channelSubscription.deletedAt),
					},
				},
			}),
			db.query.channel.findMany({
				where: and(
					eq(schema.channel.organizationId, organizationId),
					isNull(schema.channel.deletedAt),
				),
			}),
		]);

		if (!contact) {
			log.warn("Contact not found", { contactId, organizationId });
			throw ContactErrors.contactNotFound(contactId);
		}

		// Map property values to Record<string, string>
		const properties = contact.propertyValues.reduce(
			(acc, pv) => {
				acc[pv.property.propertyName] = pv.value;
				return acc;
			},
			{} as Record<string, string>,
		);

		// Map contactGroups join rows to { id, name }
		const groups = contact.contactGroups
			.filter((cg) => cg.group !== null)
			.map((cg) => ({ id: cg.group.id, name: cg.group.name }));

		// Build an O(1) lookup map from the contact's explicit enrollments.
		const enrollmentByChannelId = new Map(
			contact.contactChannels
				.filter((en) => en.deletedAt === null)
				.map((en) => [en.channelId, en.status]),
		);

		// Map enrollments to { id, name, subscription } — O(1) per channel lookup.
		const channels = allChannels.map((t) => {
			const explicitStatus = enrollmentByChannelId.get(t.id);
			return {
				id: t.id,
				name: t.name,
				subscription: (explicitStatus !== undefined
					? explicitStatus === "enrolled"
						? "opt_in"
						: "opt_out"
					: t.defaultSubscription) as "opt_in" | "opt_out",
			};
		});

		// Suppression is flat on the contact row
		const suppressionReason = contact.suppressionReason ?? null;
		const suppressedAt = contact.suppressedAt ?? null;

		log.info("Contact retrieved successfully", {
			contactId,
			organizationId,
			propertyCount: contact.propertyValues.length,
			groupCount: groups.length,
			channelCount: channels.length,
			suppressed: suppressionReason !== null,
		});

		return {
			object: "contact",
			id: contact.id,
			email: contact.email,
			firstName: contact.firstName,
			lastName: contact.lastName,
			status: contact.status,
			properties: properties ?? {},
			groups: groups ?? [],
			channels: channels ?? [],
			suppressionReason,
			suppressedAt,
			createdAt: contact.createdAt,
			updatedAt: contact.updatedAt,
			event: CONTACT_GET_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error("Error getting contact", {
			contactId,
			organizationId,
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
