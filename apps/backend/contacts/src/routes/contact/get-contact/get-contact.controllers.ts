import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { log } from "evlog";

export async function getContactController({
	contactId,
	organizationId,
	logger,
}: {
	contactId: string;
	organizationId: string;
	logger?: any;
}): Promise<ContactTypes.ContactResponse> {
	log.info({ ...{ contactId, organizationId }, message: "Getting contact" });

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
			log.warn({
				...{ contactId, organizationId },
				message: "Contact not found",
			});
			throw status(404, { message: "Contact not found" });
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

		// Get all organization channels to merge with explicit enrollments
		const allChannels = await db.query.channel.findMany({
			where: and(
				eq(schema.channel.organizationId, organizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		// Map enrollments to { id, name, subscription }
		const channels = allChannels.map((t) => {
			const explicitEnrollment = contact.contactChannels.find(
				(en) => en.channelId === t.id && en.deletedAt === null,
			);

			if (explicitEnrollment) {
				return {
					id: t.id,
					name: t.name,
					subscription: (explicitEnrollment.status === "enrolled"
						? "opt_in"
						: "opt_out") as "opt_in" | "opt_out",
				};
			}

			// Fallback to channel default if no explicit enrollment exists
			return {
				id: t.id,
				name: t.name,
				subscription: t.defaultSubscription as "opt_in" | "opt_out",
			};
		});

		// Suppression is flat on the contact row
		const suppressionReason = contact.suppressionReason ?? null;
		const suppressedAt = contact.suppressedAt ?? null;

		log.info({
			...{
				contactId,
				organizationId,
				propertyCount: contact.propertyValues.length,
				groupCount: groups.length,
				channelCount: channels.length,
				suppressed: suppressionReason !== null,
			},
			message: "Contact retrieved successfully",
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
		log.error(
			{
				contactId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting contact",
		);
		throw error;
	}
}
