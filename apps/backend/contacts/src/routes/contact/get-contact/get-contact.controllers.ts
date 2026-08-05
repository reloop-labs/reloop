import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function getContactController({
	contactId,
	organizationId,
}: {
	contactId: string;
	organizationId: string;
}): Promise<ContactTypes.ContactBaseResponse> {
	const log = useLogger();
	log.info("Getting contact", { contactId, organizationId });

	try {
		const contact = await db.query.contact.findFirst({
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
		});

		if (!contact) {
			log.warn("Contact not found", { contactId, organizationId });
			throw ContactErrors.contactNotFound(contactId);
		}

		const properties = contact.propertyValues.reduce(
			(acc, pv) => {
				acc[pv.property.propertyName] = pv.value;
				return acc;
			},
			{} as Record<string, string>,
		);

		const groups = contact.contactGroups
			.filter((cg) => cg.group !== null)
			.map((cg) => ({ id: cg.group.id, name: cg.group.name }));

		// Only explicit enrollments — channel defaultSubscription is not membership.
		const channels = contact.contactChannels
			.filter(
				(en) =>
					en.deletedAt === null &&
					en.channel !== null &&
					en.channel.deletedAt === null,
			)
			.map((en) => ({
				id: en.channel.id,
				name: en.channel.name,
				subscription: (en.status === "enrolled" ? "opt_in" : "opt_out") as
					| "opt_in"
					| "opt_out",
			}));

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
		};
	} catch (error) {
		log.error("Error getting contact", {
			contactId,
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
