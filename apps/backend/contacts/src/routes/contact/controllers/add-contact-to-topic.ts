import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

interface AddContactToTopicResult {
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

export async function addContactToTopic(
  organizationId: string,
  userId: string,
  body: ContactModel.AddContactToTopicBody,
): Promise<AddContactToTopicResult> {
  const { email, topicId } = body;
  const emailLower = email.toLowerCase();

  logger.info(
    {
      organizationId,
      email: emailLower,
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

    // Check if contact already exists
    let contact = await db.query.contact.findFirst({
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
      logger.info({ contactId: contact.id }, "Created new contact");
    } else {
      logger.info({ contactId: contact.id }, "Contact already exists");
    }

    // Check if already subscribed
    const existingSubscription = await db.query.topicSubscription.findFirst({
      where: and(
        eq(schema.topicSubscription.contactId, contact.id),
        eq(schema.topicSubscription.topicId, topicId),
        isNull(schema.topicSubscription.deletedAt),
      ),
    });

    if (existingSubscription) {
      // If unsubscribed, resubscribe
      if (existingSubscription.status === "unsubscribed") {
        await db
          .update(schema.topicSubscription)
          .set({ status: "subscribed", updatedAt: new Date() })
          .where(eq(schema.topicSubscription.id, existingSubscription.id));

        logger.info({ subscriptionId: existingSubscription.id }, "Resubscribed contact");
        return {
          contact,
          subscriptionId: existingSubscription.id,
        };
      }
      throw status(409, { message: "Contact already subscribed to this topic" });
    }

    // Create subscription
    const [subscription] = await db
      .insert(schema.topicSubscription)
      .values({
        contactId: contact.id,
        topicId,
        organizationId,
        status: "subscribed",
      })
      .returning();

    if (!subscription) {
      throw new Error("Failed to create subscription");
    }

    logger.info(
      {
        contactId: contact.id,
        subscriptionId: subscription.id,
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
        email: emailLower,
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error adding contact to topic",
    );
    throw error;
  }
}

export async function addContactToTopicHandler(
  organizationId: string,
  userId: string,
  body: ContactModel.AddContactToTopicBody,
): Promise<AddContactToTopicResult> {
  return addContactToTopic(organizationId, userId, body);
}
