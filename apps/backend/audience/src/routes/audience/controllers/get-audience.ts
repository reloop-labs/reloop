import { formatContactResponse } from "@be/audience/routes/audience/controllers/format-audience-response";
import type { ContactTypes } from "@be/audience/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getContact(
	contactId: string,
	organizationId: string,
): Promise<ContactTypes.ContactResponse> {
	logger.info(
		{
			contactId,
			organizationId,
		},
		"Getting contact",
	);

	try {
		const contact = await db.query.contact.findFirst({
			where: and(
				eq(schema.contact.id, contactId),
				eq(schema.contact.organizationId, organizationId),
				isNull(schema.contact.deletedAt),
			),
		});

		if (!contact) {
			logger.warn({ contactId, organizationId }, "Contact not found");
			throw status(404, { message: "Contact not found" });
		}

		logger.info(
			{
				contactId,
				organizationId,
			},
			"Contact retrieved successfully",
		);

		return formatContactResponse(contact);
	} catch (error) {
		logger.error(
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

export async function getContactHandler(
	contactId: string,
	organizationId: string,
): Promise<ContactTypes.ContactResponse> {
	return getContact(contactId, organizationId);
}
