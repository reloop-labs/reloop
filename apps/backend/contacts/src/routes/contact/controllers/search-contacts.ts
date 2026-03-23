import { formatContactResponse } from "@be/contacts/routes/contact/controllers/format-contact-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, ilike, inArray, isNull, type SQL } from "drizzle-orm";

export async function searchContacts(
	organizationId: string,
	query: ContactTypes.SearchContactsRequest,
): Promise<ContactTypes.ContactListResponse> {
	logger.info(
		{
			organizationId,
			searchQuery: query.query,
		},
		"Searching contacts",
	);

	try {
		const page = query.page || 1;
		const limit = query.limit || 10;
		const offset = (page - 1) * limit;

		// Build where conditions
		const whereConditions: Array<SQL<unknown>> = [
			eq(schema.contact.organizationId, organizationId),
			isNull(schema.contact.deletedAt),
		];

		// Search by email only (firstName/lastName removed from schema)
		const searchTerm = `%${query.query}%`;
		whereConditions.push(ilike(schema.contact.email, searchTerm));

		// Filter by status if provided
		if (query.status) {
			whereConditions.push(eq(schema.contact.status, query.status));
		}

		// Get total count
		const totalResult = await db
			.select({ count: count() })
			.from(schema.contact)
			.where(and(...whereConditions));

		const total = totalResult[0]?.count || 0;

		// Get contacts
		const contacts = await db.query.contact.findMany({
			where: and(...whereConditions),
			orderBy: desc(schema.contact.createdAt),
			limit,
			offset,
		});

		// Fetch all properties for these contacts
		const contactIds = contacts.map((c) => c.id);
		let propertyMap: Record<string, Record<string, string>> = {};

		if (contactIds.length > 0) {
			const allProperties = await db
				.select({
					contactId: schema.contactPropertyValue.contactId,
					name: schema.contactProperty.propertyName,
					value: schema.contactPropertyValue.value,
				})
				.from(schema.contactPropertyValue)
				.innerJoin(
					schema.contactProperty,
					eq(schema.contactPropertyValue.propertyId, schema.contactProperty.id),
				)
				.where(inArray(schema.contactPropertyValue.contactId, contactIds));

			// Group by contactId
			propertyMap = allProperties.reduce(
				(acc, curr) => {
					const contactId = curr.contactId;
					if (!acc[contactId]) {
						acc[contactId] = {};
					}
					const contactProps = acc[contactId];
					if (contactProps) {
						contactProps[curr.name] = curr.value;
					}
					return acc;
				},
				{} as Record<string, Record<string, string>>,
			);
		}

		const formattedContacts = contacts.map((contact) =>
			formatContactResponse({
				...contact,
				properties: propertyMap[contact.id] || {},
			}),
		);

		logger.info(
			{
				organizationId,
				searchQuery: query.query,
				total,
				page,
				limit,
			},
			"Contact search completed successfully",
		);

		return {
			contacts: formattedContacts,
			total,
			page,
			limit,
		};
	} catch (error) {
		logger.error(
			{
				organizationId,
				query,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error searching contacts",
		);
		throw error;
	}
}

export async function searchContactsHandler(
	organizationId: string,
	query: ContactTypes.SearchContactsRequest,
): Promise<ContactTypes.ContactListResponse> {
	return searchContacts(organizationId, query);
}
