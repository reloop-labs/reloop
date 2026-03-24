import { formatContactResponse } from "@be/contacts/routes/contact/controllers/format-contact-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import {
	and,
	count,
	desc,
	eq,
	ilike,
	inArray,
	isNull,
	type SQL,
} from "drizzle-orm";

export async function listContacts(
	organizationId: string,
	query: ContactTypes.ContactListQuery,
	logger: Logger,
): Promise<ContactTypes.ContactListResponse> {
	logger.info({ ...query }, "Listing contacts");
	try {
		const page = query.page || 1;
		const limit = query.limit || 100;
		const offset = (page - 1) * limit;

		const whereConditions: Array<SQL<unknown>> = [
			eq(schema.contact.organizationId, organizationId),
			isNull(schema.contact.deletedAt),
		];

		if (query.status) {
			whereConditions.push(eq(schema.contact.status, query.status));
		}
		if (query.search) {
			whereConditions.push(ilike(schema.contact.email, `%${query.search}%`));
		}
		const totalResult = await db
			.select({ count: count() })
			.from(schema.contact)
			.where(and(...whereConditions));
		const total = totalResult[0]?.count || 0;
		const contacts = await db.query.contact.findMany({
			where: and(...whereConditions),
			orderBy: desc(schema.contact.createdAt),
			limit,
			offset,
		});
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
		logger.info({ total, page, limit }, "Contacts listed successfully");
		return { content: "contact", contacts: formattedContacts, total, page, limit };
	} catch (error) {
		logger.error(
			{
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
	logger: Logger,
): Promise<ContactTypes.ContactListResponse> {
	return listContacts(organizationId, query, logger);
}
