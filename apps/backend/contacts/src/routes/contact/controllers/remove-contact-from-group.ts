import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function removeContactFromGroup(
  organizationId: string,
  _userId: string,
  groupId: string,
  body: ContactModel.RemoveContactFromGroupBody,
  logger: Logger,
): Promise<ContactModel.RemoveContactFromGroupResponse> {
  const { email } = body;

  logger.info(
    {
      organizationId,
      email: email.toLowerCase(),
      groupId,
    },
    "Removing contact from group",
  );

  try {
    // Identify contact
    const contact = await db.query.contact.findFirst({
      where: and(
        eq(schema.contact.email, email.toLowerCase()),
        eq(schema.contact.organizationId, organizationId),
        isNull(schema.contact.deletedAt),
      ),
    });

    if (!contact) {
      throw status(404, { message: "Contact not found" });
    }

    // Remove from group (soft delete or hard delete based on schema, contactGroup has deletedAt)
    await db
      .update(schema.contactGroup)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(schema.contactGroup.contactId, contact.id),
          eq(schema.contactGroup.groupId, groupId),
          eq(schema.contactGroup.organizationId, organizationId),
          isNull(schema.contactGroup.deletedAt),
        ),
      );

    logger.info(
      { contactId: contact.id, groupId },
      "Contact removed from group",
    );

    return {
      success: true,
      object: "contact" as const,
      id: contact.id,
    };
  } catch (error) {
    logger.error(
      {
        email: email.toLowerCase(),
        groupId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error removing contact from group",
    );
    throw error;
  }
}
