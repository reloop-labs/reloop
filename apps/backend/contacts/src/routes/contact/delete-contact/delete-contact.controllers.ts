import type { ContactModel } from "@be/contacts/model/contact.model";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { CONTACT_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";

export async function deleteContactController({
  contactId,
  organizationId,
  logger,
  cookie,
  requestDetails,
}: {
  contactId: string;
  organizationId: string;
  logger: Logger;
  cookie?: string;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
    statusCode?: number;
  };
}): Promise<
  | ContactModel.DeleteResponse
  | ContactModel.ContactNotFound
> {
  logger.info({ contactId }, "Deleting contact");

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
      return { message: "Contact not found" };
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

    logger.info({ contactId }, "Contact deleted successfully");

    const result = {
      success: true,
      object: "contact" as const,
      id: existingContact.id,
      event: CONTACT_DELETE_WEBHOOK_EVENT.id,
    };

    await createLog({
      event: CONTACT_DELETE_WEBHOOK_EVENT.id,
      cookie,
      metadata: result,
      requestDetails: { ...(requestDetails || {}), statusCode: 200 },
    });

    return result;
  } catch (error) {
    logger.error(
      { contactId, error: error instanceof Error ? error.message : String(error) },
      "Error deleting contact",
    );
    throw error;
  }
}
