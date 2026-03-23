import { formatContactResponse } from "@be/contacts/routes/contact/controllers/format-contact-response";
import { upsertContactProperties } from "@be/contacts/routes/contact/controllers/upsert-contact-properties";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { status } from "elysia";
import { getExistingContact } from "./get-existing-contact";

export async function createContact(
  organizationId: string,
  userId: string,
  body: ContactTypes.CreateContactRequest,
): Promise<ContactTypes.ContactResponse> {
  const { email } = body;
  logger.info(
    {
      email,
      organizationId,
    },
    "Creating contact",
  );

  try {
    const existingContact = await getExistingContact({ email, organizationId });

    if (existingContact) {
      logger.warn(
        { email },
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
        status: (body.status as any) || "subscribed",
        organizationId,
        userId,
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

    // Handle property values if provided
    if (body.properties && Object.keys(body.properties).length > 0) {
      await upsertContactProperties(
        newContact.id,
        organizationId,
        userId,
        body.properties,
      );
    }

    logger.info(
      {
        email: body.email,
        id: newContact.id,
      },
      "Contact created successfully",
    );

    return formatContactResponse({
      ...newContact,
      properties: body.properties || {},
    });
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
