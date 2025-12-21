import type { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

type TopicEnrollmentResponse = TopicEnrollmentModel.TopicEnrollmentResponse;

export async function unenrollContact(
  organizationId: string,
  body: TopicEnrollmentModel.UnenrollBody,
): Promise<TopicEnrollmentResponse> {
  const { contactId, topicId } = body;

  logger.info(
    {
      organizationId,
      contactId,
      topicId,
    },
    "Unenrolling contact from topic",
  );

  try {
    // Find existing enrollment
    const existingEnrollment = await db.query.topicSubscription.findFirst({
      where: and(
        eq(schema.topicSubscription.contactId, contactId),
        eq(schema.topicSubscription.topicId, topicId),
        eq(schema.topicSubscription.organizationId, organizationId),
        isNull(schema.topicSubscription.deletedAt),
      ),
    });

    if (!existingEnrollment) {
      // No existing enrollment - create one with unenrolled status
      // This handles the case where a contact is implicitly enrolled via topic's autoEnroll setting
      const [newEnrollment] = await db
        .insert(schema.topicSubscription)
        .values({
          contactId,
          topicId,
          organizationId,
          status: "unenrolled",
        })
        .returning();

      if (!newEnrollment) {
        throw new Error("Failed to create unenrolled enrollment");
      }

      logger.info(
        { enrollmentId: newEnrollment.id, contactId, topicId },
        "Created new unenrolled enrollment for implicit enrollment"
      );

      return newEnrollment;
    }

    // Update to unenrolled
    const [updated] = await db
      .update(schema.topicSubscription)
      .set({
        status: "unenrolled",
        updatedAt: new Date(),
      })
      .where(eq(schema.topicSubscription.id, existingEnrollment.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update enrollment");
    }

    logger.info(
      {
        enrollmentId: updated.id,
        contactId,
        topicId,
      },
      "Contact unenrolled successfully",
    );

    return updated;
  } catch (error) {
    logger.error(
      {
        contactId,
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error unenrolling contact",
    );
    throw error;
  }
}

export async function unsubscribeContactHandler(
  organizationId: string,
  body: TopicEnrollmentModel.UnenrollBody,
): Promise<TopicEnrollmentResponse> {
  return unenrollContact(organizationId, body);
}
