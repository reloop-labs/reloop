import { formatContactResponse } from "@be/audience/routes/audience/controllers/format-audience-response";
import type { ContactTypes } from "@be/audience/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createContact(
	organizationId: string,
	body: ContactTypes.CreateContactRequest,
): Promise<ContactTypes.ContactResponse> {
	logger.info(
		{
			email: body.email,
			organizationId,
		},
		"Creating contact",
	);

	try {
		// Check if contact already exists in this organization
		const existingContact = await db
			.select()
			.from(schema.contact)
			.where(
				and(
					eq(schema.contact.email, body.email),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			)
			.limit(1);

		if (existingContact.length > 0) {
			logger.warn(
				{ email: body.email },
				"Contact already exists in this organization",
			);
			throw status(409, { message: "Contact already exists" });
		}

		const [newContact] = await db
			.insert(schema.contact)
			.values({
				email: body.email,
				firstName: body.firstName || null,
				lastName: body.lastName || null,
				organizationId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newContact) {
			logger.error(
				{ email: body.email },
				"Failed to create contact - no data returned",
			);
			throw status(500, { message: "Failed to create contact" });
		}

		logger.info(
			{
				email: body.email,
				id: newContact.id,
			},
			"Contact created successfully",
		);

		return formatContactResponse(newContact);
	} catch (error) {
		logger.error(
			{
				email: body.email,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error creating contact",
		);
		throw error;
	}
}

export async function createContactHandler(
	organizationId: string,
	body: ContactTypes.CreateContactRequest,
): Promise<ContactTypes.ContactResponse> {
	return createContact(organizationId, body);
}
