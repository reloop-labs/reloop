import { upsertContactProperties } from "@be/contacts/routes/contact/utils/upsert-contact-properties";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { CONTACT_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { getExistingContact } from "./get-existing-contact";

export async function createContactController({
	organizationId,
	userId,
	body,
	logger,
	cookie,
	requestDetails,
}: {
	organizationId: string;
	userId: string;
	body: ContactTypes.CreateContactRequest;
	logger: Logger;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<ContactTypes.ContactResponse> {
	const { email } = body;
	try {
		return await db.transaction(async (tx) => {
			const existingContact = await getExistingContact({
				email,
				organizationId,
				logger,
				db: tx,
			});
			if (existingContact) {
				logger.warn({ email }, "Contact already exists in this organization");
				throw status(409, { message: "Contact already exists" });
			}

			logger.warn({ email }, "Contact not found, creating new contact");
			const [newContact] = await tx
				.insert(schema.contact)
				.values({
					email: body.email,
					firstName: body.firstName || null,
					lastName: body.lastName || null,
					status: body.status || "subscribed",
					organizationId,
					userId,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			if (!newContact) {
				logger.error({ email }, "Failed to create contact - no data returned");
				throw status(500, { message: "Failed to create contact" });
			}
			logger.info({ ...newContact }, "Contact added");
			if (body.properties && Object.keys(body.properties).length > 0) {
				await upsertContactProperties({
					contactId: newContact.id,
					organizationId,
					userId,
					properties: body.properties,
					logger,
					db: tx,
				});
			}
			if (body.groupIds && body.groupIds.length > 0) {
				logger.info(
					{ contactId: newContact.id, groupIds: body.groupIds },
					"Adding contact to groups",
				);
				await tx.insert(schema.contactGroup).values(
					body.groupIds.map((groupId) => ({
						contactId: newContact.id,
						groupId,
						organizationId,
						userId,
					})),
				);
			}
			if (body.channels && body.channels.length > 0) {
				logger.info(
					{ contactId: newContact.id, channelCount: body.channels.length },
					"Enrolling contact in channels",
				);
				await tx.insert(schema.channelSubscription).values(
					body.channels.map((channel) => ({
						contactId: newContact.id,
						channelId: channel.channelId,
						organizationId,
						status: (channel.subscription === "opt_in"
							? "enrolled"
							: "unenrolled") as "enrolled" | "unenrolled",
					})),
				);
			}
			logger.info(
				{ email: body.email, id: newContact.id },
				"Contact created successfully",
			);

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
				createdAt: newContact.createdAt,
				updatedAt: newContact.updatedAt,
				event: CONTACT_CREATE_WEBHOOK_EVENT.id,
			};

			await createLog({
				event: CONTACT_CREATE_WEBHOOK_EVENT.id,
				cookie,
				metadata: result,
				requestDetails: { ...(requestDetails || {}), statusCode: 201 },
			});

			return result;
		});
	} catch (error) {
		logger.error({ email: body.email, error }, "Debug creating contact");
		throw error;
	}
}
