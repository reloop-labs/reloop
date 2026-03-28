import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function addContactToGroupController({
  organizationId,
  userId,
  groupId,
  body,
  logger,
}: {
  organizationId: string;
  userId: string;
  groupId: string;
  body: ContactModel.AddContactToGroupBody;
  logger: Logger;
}): Promise<ContactModel.AddContactToGroupResponse> {
  const { contact_id, email } = body;

  if (!contact_id && !email) {
    throw status(400, { message: "Either 'contact_id' or 'email' must be provided" });
  }

  logger.info(
    {
      organizationId,
      contactId: contact_id,
      email: email?.toLowerCase(),
      groupId,
    },
    "Adding contact to group",
  );

  try {
    // Verify group exists
    const group = await db.query.group.findFirst({
      where: and(
        eq(schema.group.id, groupId),
        eq(schema.group.organizationId, organizationId),
        isNull(schema.group.deletedAt),
      ),
    });

    if (!group) {
      throw status(404, { message: "Group not found" });
    }

    // Identify contact
    let contact: typeof schema.contact.$inferSelect | undefined;

    if (contact_id) {
      contact = await db.query.contact.findFirst({
        where: and(
          eq(schema.contact.id, contact_id),
          eq(schema.contact.organizationId, organizationId),
          isNull(schema.contact.deletedAt),
        ),
      });
    } else if (email) {
      const emailLower = email.toLowerCase();
      contact = await db.query.contact.findFirst({
        where: and(
          eq(schema.contact.email, emailLower),
          eq(schema.contact.organizationId, organizationId),
          isNull(schema.contact.deletedAt),
        ),
      });

      // Create contact if doesn't exist
      if (!contact) {
        const [newContact] = await db
          .insert(schema.contact)
          .values({
            email: emailLower,
            status: "subscribed",
            organizationId,
            userId,
          })
          .returning();

        if (!newContact) {
          throw new Error("Failed to create contact");
        }
        contact = newContact;
        logger.info({ contactId: contact.id }, "Created new contact from email");
      }
    }

    if (!contact) {
      throw status(404, { message: "Contact not found" });
    }

    // Check if already in group
    const existing = await db.query.contactGroup.findFirst({
      where: and(
        eq(schema.contactGroup.contactId, contact.id),
        eq(schema.contactGroup.groupId, groupId),
        isNull(schema.contactGroup.deletedAt),
      ),
    });

    if (existing) {
      return {
        success: true,
        object: "contact" as const,
        id: contact.id,
      };
    }

    // Add to group
    await db.insert(schema.contactGroup).values({
      contactId: contact.id,
      groupId,
      organizationId,
      userId,
    });

    logger.info({ contactId: contact.id, groupId }, "Contact added to group");

    return {
      success: true,
      object: "contact" as const,
      id: contact.id,
    };
  } catch (error) {
    logger.error(
      {
        contactId: contact_id,
        email: email?.toLowerCase(),
        groupId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error adding contact to group",
    );
    throw error;
  }
}
