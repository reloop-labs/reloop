import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function deleteContactController({
  contactId,
  organizationId,
}: {
  contactId: string;
  organizationId: string;
}): Promise<{ success: boolean; object: "contact"; id: string }> {
  logger.info(
    {
      contactId,
      organizationId,
    },
    "Deleting contact",
  );

  try {
    // Check if contact exists
    const existingContact = await db.query.contact.findFirst({
      where: and(
        eq(schema.contact.id, contactId),
        eq(schema.contact.organizationId, organizationId),
      ),
    });

    if (!existingContact) {
      logger.warn({ contactId, organizationId }, "Contact not found");
      throw status(404, { message: "Contact not found" });
    }

    // Delete the contact (hard delete)
    await db
      .delete(schema.contact)
      .where(
        and(
          eq(schema.contact.id, contactId),
          eq(schema.contact.organizationId, organizationId),
        ),
      );

    logger.info(
      {
        contactId,
        organizationId,
      },
      "Contact deleted successfully",
    );

    return { success: true, object: "contact", id: contactId };
  } catch (error) {
    logger.error(
      {
        contactId,
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error deleting contact",
    );
    throw error;
  }
}
