import type { ContactModel } from "@be/contacts/model/contact.model";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

import { status } from "elysia";

export async function updateContactChannelController({
  organizationId,
  channelId,
  body,
  logger,
  cookie,
  requestDetails,
}: {
  organizationId: string;
  channelId: string;
  body: ContactModel.UpdateContactChannelBody;
  logger: Logger;
  cookie?: string;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
    statusCode?: number;
  };
}): Promise<ContactModel.UpdateContactChannelResponse> {
  const { contact_id, email, subscription } = body;

  if (!contact_id && !email) {
    throw status(400, { message: "Either 'contact_id' or 'email' must be provided" });
  }

  logger.info(
    {
      contactId: contact_id,
      email: email?.toLowerCase(),
      channelId,
      subscription,
    },
    "Updating contact channel status",
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

    logger.info({ contactId: contact.id, channelId }, "Checking existing channel enrollment");
    const existing = await db.query.channelSubscription.findFirst({
      where: and(
        eq(schema.channelSubscription.contactId, contact.id),
        eq(schema.channelSubscription.channelId, channelId),
        eq(schema.channelSubscription.organizationId, organizationId),
        isNull(schema.channelSubscription.deletedAt),
      ),
    });

    if (existing) {
      if (existing.status !== targetStatus) {
        await db
          .update(schema.channelSubscription)
          .set({ status: targetStatus, updatedAt: new Date() })
          .where(eq(schema.channelSubscription.id, existing.id));

        logger.info(
          { subscriptionId: existing.id, status: targetStatus },
          "Updated contact subscription status",
        );
      }
    } else {
      await db.insert(schema.channelSubscription).values({
        contactId: contact.id,
        channelId,
        organizationId,
        status: targetStatus,
      });

      logger.info(
        { contactId: contact.id, channelId, status: targetStatus },
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
        channelId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating contact channel status",
    );
    throw error;
  }
}
