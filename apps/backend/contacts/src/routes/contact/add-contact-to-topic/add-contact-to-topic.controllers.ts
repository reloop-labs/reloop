import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export interface AddContactToTopicResult {
  contact: {
    id: string;
    email: string;
    status: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  };
  subscriptionId: string;
}

export async function addContactToTopicController({
  organizationId,
  userId,
  topicId,
  body,
}: {
  organizationId: string;
  userId: string;
  topicId: string;
  body: ContactModel.AddContactToTopicBody;
}): Promise<AddContactToTopicResult> {
  const { contact_id, email } = body;

  if (!contact_id && !email) {
    throw status(400, { message: "Either 'contact_id' or 'email' must be provided" });
  }

  logger.info(
    {
      organizationId,
      contactId: contact_id,
      email: email?.toLowerCase(),
      topicId,
    },
    "Adding contact to topic",
  );

  try {
    // Verify topic exists
    const topic = await db.query.topic.findFirst({
      where: and(
        eq(schema.topic.id, topicId),
        eq(schema.topic.organizationId, organizationId),
        isNull(schema.topic.deletedAt),
      ),
    });

    if (!topic) {
      throw status(404, { message: "Topic not found" });
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

    }

    if (!contact) {
      logger.info({ contact_id, email }, "Contact not found");
      throw status(404, { message: "Contact not found" });
    }

    logger.info({ contactId: contact.id, topicId }, "Checking if contact is already subscribed to topic");
    const existingSubscription = await db.query.topicEnrollment.findFirst({
      where: and(
        eq(schema.topicEnrollment.contactId, contact.id),
        eq(schema.topicEnrollment.topicId, topicId),
        isNull(schema.topicEnrollment.deletedAt),
      ),
    });

    const targetStatus = (body.subscription === "opt_out"
      ? "unenrolled"
      : "enrolled") as "enrolled" | "unenrolled";

    if (existingSubscription) {
      // If status is different, update it
      if (existingSubscription.status !== targetStatus) {
        await db
          .update(schema.topicEnrollment)
          .set({ status: targetStatus, updatedAt: new Date() })
          .where(eq(schema.topicEnrollment.id, existingSubscription.id));

        logger.info(
          { subscriptionId: existingSubscription.id, status: targetStatus },
          "Updated contact subscription status",
        );
        return {
          contact,
          subscriptionId: existingSubscription.id,
        };
      }

      throw status(409, {
        message: `Contact is already ${existingSubscription.status} in this topic`,
      });
    }

    // Create subscription
    const [subscription] = await db
      .insert(schema.topicEnrollment)
      .values({
        contactId: contact.id,
        topicId,
        organizationId,
        status: targetStatus,
      })
      .returning();

    if (!subscription) {
      throw new Error("Failed to create subscription");
    }

    logger.info(
      {
        contactId: contact.id,
        subscriptionId: subscription.id,
        status: targetStatus,
      },
      "Contact added to topic successfully",
    );

    return {
      contact,
      subscriptionId: subscription.id,
    };
  } catch (error) {
    logger.error(
      {
        contactId: contact_id,
        email: email?.toLowerCase(),
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error adding contact to topic",
    );
    throw error;
  }
}
