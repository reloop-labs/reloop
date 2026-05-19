import { upsertContactProperties } from "@be/contacts/routes/contact/utils/upsert-contact-properties";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { useLogger } from "evlog/elysia";
import { getExistingContact } from "./get-existing-contact";

export async function createContactController({
	organizationId,
	userId,
	email,
	firstName,
	lastName,
	status: contactStatus,
	properties,
	groupIds,
	channels,
}: {
	organizationId: string;
	userId: string;
} & ContactTypes.CreateContactRequest): Promise<ContactTypes.ContactResponse> {
	const logger = useLogger();
	try {
		return await db.transaction(async (tx) => {
			const existingContact = await getExistingContact({
				email,
				organizationId,
				db: tx,
			});
			if (existingContact) {
				logger?.warn("Contact already exists in this organization", { email });
				throw status(409, { message: "Contact already exists" });
			}

			logger?.warn("Contact not found, creating new contact", { email });
			const [newContact] = await tx
				.insert(schema.contact)
				.values({
					email: email,
					firstName: firstName || null,
					lastName: lastName || null,
					status: contactStatus || "subscribed",
					organizationId,
					userId,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			if (!newContact) {
				logger?.error("Failed to create contact - no data returned", { email });
				throw status(500, { message: "Failed to create contact" });
			}
			logger?.info("Contact added", {
				...newContact,
				status: undefined,
				currentStatus: newContact.status,
			});
			if (properties && Object.keys(properties).length > 0) {
				await upsertContactProperties({
					contactId: newContact.id,
					organizationId,
					userId,
					properties: properties,
					db: tx,
				});
			}
			if (groupIds && groupIds.length > 0) {
				logger?.info("Adding contact to groups", {
					contactId: newContact.id,
					groupIds: groupIds,
				});
				await tx.insert(schema.contactGroup).values(
					groupIds.map((groupId) => ({
						contactId: newContact.id,
						groupId,
						organizationId,
						userId,
					})),
				);
			}
			if (channels && channels.length > 0) {
				logger?.info("Enrolling contact in channels", {
					contactId: newContact.id,
					channelCount: channels.length,
				});
				await tx.insert(schema.channelSubscription).values(
					channels.map((channel) => ({
						contactId: newContact.id,
						channelId: channel.channelId,
						organizationId,
						status: (channel.subscription === "opt_in"
							? "enrolled"
							: "unenrolled") as "enrolled" | "unenrolled",
					})),
				);
			}
			logger?.info("Contact created successfully", {
				email: email,
				id: newContact.id,
			});

			// Fetch final properties to ensure types are correct in response
			const updatedProperties = await tx
				.select({
					name: schema.contactProperty.propertyName,
					value: schema.contactPropertyValue.value,
					type: schema.contactProperty.propertyType,
				})
				.from(schema.contactPropertyValue)
				.innerJoin(
					schema.contactProperty,
					eq(schema.contactPropertyValue.propertyId, schema.contactProperty.id),
				)
				.where(
					and(
						eq(schema.contactPropertyValue.contactId, newContact.id),
						eq(schema.contactPropertyValue.organizationId, organizationId),
						isNull(schema.contactProperty.deletedAt),
						isNull(schema.contactPropertyValue.deletedAt),
					),
				);

			const propertiesRecord = updatedProperties.reduce(
				(acc, curr) => {
					acc[curr.name] =
						curr.type === "number" ? Number(curr.value) : curr.value;
					return acc;
				},
				{} as Record<string, string | number>,
			);

			const result = {
				object: "contact" as const,
				id: newContact.id,
				email: newContact.email,
				firstName: newContact.firstName,
				lastName: newContact.lastName,
				status: newContact.status,
				properties: propertiesRecord ?? {},
				groups: (newContact as ContactTypes.ContactData).groups ?? [],
				channels: (newContact as ContactTypes.ContactData).channels ?? [],
				suppressionReason: newContact.suppressionReason ?? null,
				suppressedAt: newContact.suppressedAt ?? null,
				createdAt: newContact.createdAt,
				updatedAt: newContact.updatedAt,
				event: CONTACT_CREATE_WEBHOOK_EVENT.id,
			};

			return result;
		});
	} catch (error) {
		logger?.error("Debug creating contact", {
			email: email,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
