import { formatContactResponse } from "@be/contacts/routes/contact/controllers/format-contact-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, ilike, isNull, type SQL } from "drizzle-orm";

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

		const formattedContacts = contacts.map(formatContactResponse);

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
