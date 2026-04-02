import type { ContactModel } from "@be/contacts/model/contact.model";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

import { status } from "elysia";

export async function updateContactTopicController({
  organizationId,
  topicId,
  body,
  logger,
  cookie,
  requestDetails,
}: {
  organizationId: string;
  topicId: string;
  body: ContactModel.UpdateContactTopicBody;
  logger: Logger;
  cookie?: string;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
    statusCode?: number;
  };
}): Promise<ContactModel.UpdateContactTopicResponse> {
  const { contact_id, email, subscription } = body;

  if (!contact_id && !email) {
    throw status(400, { message: "Either 'contact_id' or 'email' must be provided" });
  }

  logger.info(
    {
      contactId: contact_id,
      email: email?.toLowerCase(),
      topicId,
      subscription,
    },
    "Updating contact topic status",
  );

  try {
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
      contact = await db.query.contact.findFirst({
        where: and(
          eq(schema.contact.email, email.toLowerCase()),
          eq(schema.contact.organizationId, organizationId),
          isNull(schema.contact.deletedAt),
        ),
      });
    }

    if (!contact) {
      logger.info({ contact_id, email }, "Contact not found");
      throw status(404, { message: "Contact not found" });
    }

    const targetStatus = (
      subscription === "opt_out" ? "unenrolled" : "enrolled"
    ) as "enrolled" | "unenrolled";

    logger.info({ contactId: contact.id, topicId }, "Checking existing topic enrollment");
    const existing = await db.query.topicEnrollment.findFirst({
      where: and(
        eq(schema.topicEnrollment.contactId, contact.id),
        eq(schema.topicEnrollment.topicId, topicId),
        eq(schema.topicEnrollment.organizationId, organizationId),
        isNull(schema.topicEnrollment.deletedAt),
      ),
    });

    if (existing) {
      if (existing.status !== targetStatus) {
        await db
          .update(schema.topicEnrollment)
          .set({ status: targetStatus, updatedAt: new Date() })
          .where(eq(schema.topicEnrollment.id, existing.id));

        logger.info(
          { subscriptionId: existing.id, status: targetStatus },
          "Updated contact subscription status",
        );
      }
    } else {
      await db.insert(schema.topicEnrollment).values({
        contactId: contact.id,
        topicId,
        organizationId,
        status: targetStatus,
      });

      logger.info(
        { contactId: contact.id, topicId, status: targetStatus },
        "Created new contact subscription",
      );
    }

    const result = {
      success: true,
      status: targetStatus,
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
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating contact topic status",
    );
    throw error;
  }
}
