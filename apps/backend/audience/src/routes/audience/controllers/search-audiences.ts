import { formatContactResponse } from "@be/audience/routes/audience/controllers/format-audience-response";
import type { ContactTypes } from "@be/audience/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";

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

		// Advanced search across multiple fields
		const searchTerm = `%${query.query}%`;
		const searchCondition = or(
			ilike(schema.contact.email, searchTerm),
			ilike(schema.contact.firstName, searchTerm),
			ilike(schema.contact.lastName, searchTerm),
		);

		if (searchCondition) {
			whereConditions.push(searchCondition);
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
