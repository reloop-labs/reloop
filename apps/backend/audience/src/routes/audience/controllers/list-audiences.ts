import { formatContactResponse } from "@be/audience/routes/audience/controllers/format-audience-response";
import type { ContactTypes } from "@be/audience/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";

export async function listContacts(
	organizationId: string,
	query: ContactTypes.ContactListQuery,
): Promise<ContactTypes.ContactListResponse> {
	logger.info(
		{
			organizationId,
			query,
		},
		"Listing contacts",
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

		if (query.search) {
			const searchCondition = or(
				ilike(schema.contact.email, `%${query.search}%`),
				ilike(schema.contact.firstName, `%${query.search}%`),
				ilike(schema.contact.lastName, `%${query.search}%`),
			);

			if (searchCondition) {
				whereConditions.push(searchCondition);
			}
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
				total,
				page,
				limit,
			},
			"Contacts listed successfully",
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
			"Error listing contacts",
		);
		throw error;
	}
}

export async function listContactsHandler(
	organizationId: string,
	query: ContactTypes.ContactListQuery,
): Promise<ContactTypes.ContactListResponse> {
	return listContacts(organizationId, query);
}
