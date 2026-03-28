import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export async function updateContactTopicController({
  organizationId,
  userId,
  topicId,
  body,
  logger,
}: {
  organizationId: string;
  userId: string;
  topicId: string;
  body: ContactModel.UpdateContactTopicBody;
  logger: Logger;
}): Promise<ContactModel.UpdateContactTopicResponse> {
  const { email, subscription } = body;

  logger.info(
    {
      organizationId,
      email: email.toLowerCase(),
      topicId,
      subscription,
    },
    "Updating contact topic status",
  );

  try {
    // Identify contact
    const emailLower = email.toLowerCase();
    let contact = await db.query.contact.findFirst({
      where: and(
        eq(schema.contact.email, emailLower),
        eq(schema.contact.organizationId, organizationId),
        isNull(schema.contact.deletedAt),
      ),
    });

    // If identified by email and not found, create it (consistency with addContactToTopic)
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
      logger.info({ contactId: contact.id }, "Created new contact");
    }

    const targetStatus = (
      subscription === "opt_out" ? "unenrolled" : "enrolled"
    ) as "enrolled" | "unenrolled";

    // Upsert topic enrollment
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

    return {
      success: true,
      status: targetStatus,
    };
  } catch (error) {
    logger.error(
      {
        email: email.toLowerCase(),
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating contact topic status",
    );
    throw error;
  }
}
