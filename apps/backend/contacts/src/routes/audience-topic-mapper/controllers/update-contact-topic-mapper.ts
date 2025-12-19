import type { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

type TopicEnrollmentResponse = TopicEnrollmentModel.TopicEnrollmentResponse;

export async function updateTopicEnrollment(params: {
  enrollmentId: string;
  organizationId: string;
  enrollmentStatus: "enrolled" | "unenrolled";
}): Promise<TopicEnrollmentResponse> {
  const { enrollmentId, organizationId, enrollmentStatus } = params;

  try {
    // Check if enrollment exists
    const existingEnrollment = await db.query.topicSubscription.findFirst({
      where: and(
        eq(schema.topicSubscription.id, enrollmentId),
        eq(schema.topicSubscription.organizationId, organizationId),
        isNull(schema.topicSubscription.deletedAt),
      ),
    });

    if (!existingEnrollment) {
      throw status(404, { message: "Topic enrollment not found" });
    }

    const [updatedEnrollment] = await db
      .update(schema.topicSubscription)
      .set({
        status: enrollmentStatus,
        updatedAt: new Date(),
      })
      .where(eq(schema.topicSubscription.id, enrollmentId))
      .returning();

    if (!updatedEnrollment) {
      throw new Error("Failed to update topic enrollment");
    }

    return updatedEnrollment;
  } catch (error) {
    logger.error(
      {
        enrollmentId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating topic enrollment",
    );
    throw error;
  }
}

export async function updateTopicSubscriptionHandler(params: {
  subscriptionId: string;
  organizationId: string;
  subscriptionStatus: "enrolled" | "unenrolled";
}): Promise<TopicEnrollmentResponse> {
  return await updateTopicEnrollment({
    enrollmentId: params.subscriptionId,
    organizationId: params.organizationId,
    enrollmentStatus: params.subscriptionStatus,
  });
}

