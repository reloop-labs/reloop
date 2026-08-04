import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import { upsertContactProperties } from "@be/contacts/routes/contact/utils/upsert-contact-properties";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import {
	attachAuditChanges,
	computeContactFieldChanges,
} from "@be/contacts/utils/contact-field-changes";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function updateContactController({
	contactId,
	organizationId,
	email,
	firstName,
	lastName,
	status: contactStatus,
	properties,
}: {
	contactId: string;
	organizationId: string;
} & ContactTypes.UpdateContactRequest): Promise<ContactTypes.ContactResponse> {
	const log = useLogger();
	log.info("Updating contact", { contactId, organizationId });

	try {
		const { finalContact, previousStatus } = await db.transaction(
			async (tx) => {
				const existingContact = await tx.query.contact.findFirst({
					where: and(
						eq(schema.contact.id, contactId),
						eq(schema.contact.organizationId, organizationId),
						isNull(schema.contact.deletedAt),
					),
				});

				if (!existingContact) {
					log.warn("Contact not found", { contactId, organizationId });
					throw ContactErrors.contactNotFound(contactId);
				}

				// Snapshot current properties for field-level audit diffs
				const existingPropertyRows = await tx
					.select({
						name: schema.contactProperty.propertyName,
						value: schema.contactPropertyValue.value,
						type: schema.contactProperty.propertyType,
					})
					.from(schema.contactPropertyValue)
					.innerJoin(
						schema.contactProperty,
						eq(
							schema.contactPropertyValue.propertyId,
							schema.contactProperty.id,
						),
					)
					.where(
						and(
							eq(schema.contactPropertyValue.contactId, contactId),
							eq(schema.contactPropertyValue.organizationId, organizationId),
							isNull(schema.contactProperty.deletedAt),
							isNull(schema.contactPropertyValue.deletedAt),
						),
					);

				const existingProperties = existingPropertyRows.reduce(
					(acc, curr) => {
						acc[curr.name] =
							curr.type === "number" ? Number(curr.value) : curr.value;
						return acc;
					},
					{} as Record<string, string | number>,
				);

				const fieldChanges = computeContactFieldChanges(
					{
						email: existingContact.email,
						firstName: existingContact.firstName,
						lastName: existingContact.lastName,
						status: existingContact.status,
						properties: existingProperties,
					},
					{
						email,
						firstName,
						lastName,
						status: contactStatus,
						properties,
					},
				);

				const updateData: Partial<typeof schema.contact.$inferInsert> = {
					updatedAt: new Date(),
				};

				if (email !== undefined) {
					updateData.email = email;
				}
				if (firstName !== undefined) {
					updateData.firstName = firstName;
				}
				if (lastName !== undefined) {
					updateData.lastName = lastName;
				}
				if (contactStatus !== undefined) {
					updateData.status = contactStatus;
				}

				const [updatedContact] = await tx
					.update(schema.contact)
					.set(updateData)
					.where(
						and(
							eq(schema.contact.id, contactId),
							eq(schema.contact.organizationId, organizationId),
						),
					)
					.returning();

				if (!updatedContact) {
					log.error("Failed to update contact - no data returned", {
						contactId,
					});
					throw ContactErrors.databaseError("Failed to update contact");
				}

				if (properties !== undefined) {
					await upsertContactProperties({
						contactId,
						organizationId,
						userId: existingContact.userId,
						properties: properties,
						db: tx,
					});
				}

				log.info("Contact updated successfully", {
					contactId,
					organizationId,
				});

				const updatedProperties = await tx
					.select({
						name: schema.contactProperty.propertyName,
						value: schema.contactPropertyValue.value,
						type: schema.contactProperty.propertyType,
					})
					.from(schema.contactPropertyValue)
					.innerJoin(
						schema.contactProperty,
						eq(
							schema.contactPropertyValue.propertyId,
							schema.contactProperty.id,
						),
					)
					.where(
						and(
							eq(schema.contactPropertyValue.contactId, contactId),
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

				const finalContact = {
					object: "contact" as const,
					id: updatedContact.id,
					email: updatedContact.email,
					firstName: updatedContact.firstName,
					lastName: updatedContact.lastName,
					status: updatedContact.status,
					properties: propertiesRecord ?? {},
					groups: (updatedContact as ContactTypes.ContactData).groups ?? [],
					channels: (updatedContact as ContactTypes.ContactData).channels ?? [],
					suppressionReason: updatedContact.suppressionReason ?? null,
					suppressedAt: updatedContact.suppressedAt ?? null,
					createdAt: updatedContact.createdAt,
					updatedAt: updatedContact.updatedAt,
					event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
				};

				// Attach for auditLogHook (WeakMap; not serialized in response)
				attachAuditChanges(finalContact, fieldChanges);

				return {
					finalContact,
					previousStatus: existingContact.status,
				};
			},
		);

		const lifecyclePayload = {
			organizationId,
			contactId: finalContact.id,
			email: finalContact.email,
			firstName: finalContact.firstName,
			lastName: finalContact.lastName,
			status: finalContact.status,
		};

		await bus
			.publish(BusEvent.CONTACT_UPDATED, lifecyclePayload)
			.catch((err) => {
				log.error("Failed to publish CONTACT_UPDATED", {
					contactId,
					error: err instanceof Error ? err.message : String(err),
				});
			});

		if (contactStatus !== undefined && contactStatus !== previousStatus) {
			const statusEvent =
				contactStatus === "subscribed"
					? BusEvent.CONTACT_SUBSCRIBED
					: contactStatus === "unsubscribed"
						? BusEvent.CONTACT_UNSUBSCRIBED
						: contactStatus === "blocked"
							? BusEvent.CONTACT_BLOCKED
							: null;

			if (statusEvent) {
				await bus.publish(statusEvent, lifecyclePayload).catch((err) => {
					log.error("Failed to publish contact status event", {
						contactId,
						newStatus: contactStatus,
						error: err instanceof Error ? err.message : String(err),
					});
				});
			}
		}

		return finalContact;
	} catch (error) {
		log.error("Error updating contact", {
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
