import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, inArray, isNull } from "drizzle-orm";

interface BulkImportResult {
  created: number;
  skipped: number;
  errors: Array<{ email: string; reason: string }>;
}

export async function bulkImportContacts(
  organizationId: string,
  userId: string,
  body: ContactModel.BulkImportContactsBody,
): Promise<BulkImportResult> {
  logger.info(
    {
      organizationId,
      contactCount: body.contacts.length,
    },
    "Bulk importing contacts",
  );

  const result: BulkImportResult = {
    created: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Get emails from input
    const emails = body.contacts.map((c) => c.email.toLowerCase());

    // Find existing contacts with these emails in this organization
    const existingContacts = await db
      .select({ email: schema.contact.email })
      .from(schema.contact)
      .where(
        and(
          eq(schema.contact.organizationId, organizationId),
          inArray(schema.contact.email, emails),
          isNull(schema.contact.deletedAt),
        ),
      );

    const existingEmails = new Set(
      existingContacts.map((c) => c.email.toLowerCase()),
    );

    // Separate new contacts from existing ones
    const contactsToCreate: Array<{
      email: string;
      status: "subscribed" | "unsubscribed" | "blocked";
      organizationId: string;
      userId: string;
    }> = [];

    for (const contact of body.contacts) {
      const emailLower = contact.email.toLowerCase();

      if (existingEmails.has(emailLower)) {
        result.skipped++;
      } else {
        contactsToCreate.push({
          email: emailLower,
          status: "subscribed",
          organizationId,
          userId,
        });
      }
    }

    // Batch insert new contacts
    if (contactsToCreate.length > 0) {
      await db.insert(schema.contact).values(contactsToCreate);
      result.created = contactsToCreate.length;
    }

    logger.info(
      {
        organizationId,
        created: result.created,
        skipped: result.skipped,
        errors: result.errors.length,
      },
      "Bulk import completed",
    );

    return result;
  } catch (error) {
    logger.error(
      {
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error bulk importing contacts",
    );
    throw error;
  }
}

export async function bulkImportContactsHandler(
  organizationId: string,
  userId: string,
  body: ContactModel.BulkImportContactsBody,
): Promise<BulkImportResult> {
  return bulkImportContacts(organizationId, userId, body);
}
