import { upsertContactProperties } from "@be/contacts/routes/contact/utils/upsert-contact-properties";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { log } from "evlog";

export async function updateContactController({
	contactId,
	organizationId,
	body,
	logger,
	cookie,
	requestDetails,
}: {
	contactId: string;
	organizationId: string;
	body: ContactTypes.UpdateContactRequest;
	logger?: any;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<ContactTypes.ContactResponse> {
	log.info({
		...{
			contactId,
			organizationId,
			body,
		},
		message: "Updating contact",
	});

	try {
		return await db.transaction(async (tx) => {
			// Check if contact exists
			const existingContact = await tx.query.contact.findFirst({
				where: and(
					eq(schema.contact.id, contactId),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			});

			if (!existingContact) {
				log.warn({
					...{ contactId, organizationId },
					message: "Contact not found",
				});
				throw status(404, { message: "Contact not found" });
			}

			// Update the contact
			const updateData: Partial<typeof schema.contact.$inferInsert> = {
				updatedAt: new Date(),
			};

			if (body.email !== undefined) {
				updateData.email = body.email;
			}
			if (body.firstName !== undefined) {
				updateData.firstName = body.firstName;
			}
			if (body.lastName !== undefined) {
				updateData.lastName = body.lastName;
			}
			if (body.status !== undefined) {
				updateData.status = body.status;
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
				log.error({
					...{ contactId },
					message: "Failed to update contact - no data returned",
				});
				throw status(500, { message: "Failed to update contact" });
			}

			// Handle property values if provided
			if (body.properties !== undefined) {
				await upsertContactProperties({
					contactId,
					organizationId,
					userId: existingContact.userId,
					properties: body.properties,
					logger,
					db: tx,
				});
			}

			log.info({
				...{
					contactId,
					organizationId,
				},
				message: "Contact updated successfully",
			});

			// Fetch current properties after update to return them in response
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
				createdAt: updatedContact.createdAt,
				updatedAt: updatedContact.updatedAt,
				event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
			};

			await createLog({
				event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
				cookie,
				metadata: finalContact,
				requestDetails: { ...(requestDetails || {}), statusCode: 200 },
			});

			return finalContact;
		});
	} catch (error) {
		log.error(
			{
				contactId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error updating contact",
		);
		throw error;
	}
}
