import type { ContactModel } from "@be/contacts/model/contact.model";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function removeContactFromGroupController({
  organizationId,
  groupId,
  body,
  logger,
  cookie,
  requestDetails,
}: {
  organizationId: string;
  groupId: string;
  body: ContactModel.RemoveContactFromGroupBody;
  logger: Logger;
  cookie?: string;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
    statusCode?: number;
  };
}): Promise<ContactModel.RemoveContactFromGroupResponse> {
  const { contact_id, email } = body;

  if (!contact_id && !email) {
    throw status(400, { message: "Either 'contact_id' or 'email' must be provided" });
  }

  logger.info(
    {
      contactId: contact_id,
      email: email?.toLowerCase(),
      groupId,
    },
    "Removing contact from group",
  );

  try {
    // Identify contact
    const whereConditions = [
      eq(schema.contact.organizationId, organizationId),
      isNull(schema.contact.deletedAt),
    ];

    if (contact_id) {
      whereConditions.push(eq(schema.contact.id, contact_id));
    } else if (email) {
      whereConditions.push(eq(schema.contact.email, email.toLowerCase()));
    }

    const contact = await db.query.contact.findFirst({
      where: and(...whereConditions),
    });

    if (!contact) {
      throw status(404, { message: "Contact not found" });
    }

    // Remove from group
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

    const result = {
      success: true,
      object: "contact" as const,
      id: contact.id,
      event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
    };

    await createLog({
      event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
      cookie,
      metadata: result,
      requestDetails: { ...(requestDetails || {}), statusCode: 200 },
    });

    return result;
  } catch (error) {
    logger.error(
      {
        contactId: contact_id,
        email: email?.toLowerCase(),
        groupId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error removing contact from group",
    );
    throw error;
  }
}
