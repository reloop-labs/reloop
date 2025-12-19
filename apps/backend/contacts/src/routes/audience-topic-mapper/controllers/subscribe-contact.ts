import type { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

type TopicEnrollmentResponse = TopicEnrollmentModel.TopicEnrollmentResponse;

export async function enrollContact(
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
    "Enrolling contact in topic",
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

    // Update to enrolled
    const [updated] = await db
      .update(schema.topicSubscription)
      .set({
        status: "enrolled",
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
      "Contact enrolled successfully",
    );

    return updated;
  } catch (error) {
    logger.error(
      {
        contactId,
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error enrolling contact",
    );
    throw error;
  }
}

export async function subscribeContactHandler(
  organizationId: string,
  body: TopicEnrollmentModel.UnenrollBody,
): Promise<TopicEnrollmentResponse> {
  return enrollContact(organizationId, body);
}

