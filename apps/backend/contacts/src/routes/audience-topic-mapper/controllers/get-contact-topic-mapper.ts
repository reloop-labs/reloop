import type { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

type TopicEnrollmentResponse = TopicEnrollmentModel.TopicEnrollmentResponse;

export async function getTopicEnrollment(
  enrollmentId: string,
  organizationId: string,
): Promise<TopicEnrollmentResponse> {
  try {
    const result = await db.query.topicSubscription.findFirst({
      where: and(
        eq(schema.topicSubscription.id, enrollmentId),
        eq(schema.topicSubscription.organizationId, organizationId),
        isNull(schema.topicSubscription.deletedAt),
      ),
    });

    if (!result) {
      logger.warn({ enrollmentId }, "Topic enrollment not found");
      throw status(404, { message: "Topic enrollment not found" });
    }

    return result;
  } catch (error) {
    logger.error(
      {
        enrollmentId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error getting topic enrollment",
    );
    throw error;
  }
}

export async function getTopicSubscriptionHandler(
  enrollmentId: string,
  organizationId: string,
): Promise<TopicEnrollmentResponse> {
  return await getTopicEnrollment(enrollmentId, organizationId);
}

