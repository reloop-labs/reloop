import type { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function removeContactFromTopic(
  organizationId: string,
  body: TopicEnrollmentModel.UnenrollBody,
): Promise<{ success: boolean }> {
  const { contactId, topicId } = body;

  logger.info(
    {
      organizationId,
      contactId,
      topicId,
    },
    "Removing contact from topic",
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
      logger.warn(
        { contactId, topicId },
        "Enrollment not found",
      );
      throw status(404, { message: "Topic enrollment not found" });
    }

    // Soft delete the enrollment
    await db
      .update(schema.topicSubscription)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.topicSubscription.id, existingEnrollment.id));

    logger.info(
      {
        enrollmentId: existingEnrollment.id,
        contactId,
        topicId,
      },
      "Contact removed from topic successfully",
    );

    return { success: true };
  } catch (error) {
    logger.error(
      {
        contactId,
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error removing contact from topic",
    );
    throw error;
  }
}

export async function removeContactFromTopicHandler(
  organizationId: string,
  body: TopicEnrollmentModel.UnenrollBody,
): Promise<{ success: boolean }> {
  return removeContactFromTopic(organizationId, body);
}

