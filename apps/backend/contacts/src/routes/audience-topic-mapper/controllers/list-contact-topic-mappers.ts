import type { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, isNull } from "drizzle-orm";

type TopicEnrollmentQuery = TopicEnrollmentModel.TopicEnrollmentQuery;
type TopicEnrollmentListResponse = TopicEnrollmentModel.TopicEnrollmentListResponse;

export async function listTopicEnrollments(
  query: TopicEnrollmentQuery,
  organizationId: string,
): Promise<TopicEnrollmentListResponse> {
  const { page = 1, limit = 10, contactId, topicId, status: enrollmentStatus } = query;
  const offset = (page - 1) * limit;

  try {
    const conditions = [
      isNull(schema.topicSubscription.deletedAt),
      eq(schema.topicSubscription.organizationId, organizationId),
    ];

    if (contactId) {
      conditions.push(eq(schema.topicSubscription.contactId, contactId));
    }
    if (topicId) {
      conditions.push(eq(schema.topicSubscription.topicId, topicId));
    }
    if (enrollmentStatus) {
      conditions.push(eq(schema.topicSubscription.status, enrollmentStatus));
    }

    const whereClause = and(...conditions);

    const totalResult = await db
      .select({ count: count() })
      .from(schema.topicSubscription)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    const enrollments = await db.query.topicEnrollment.findMany({
      where: whereClause,
      orderBy: desc(schema.topicSubscription.createdAt),
      limit: limit,
      offset: offset,
      with: {
        contact: true,
      },
    });

    return {
      enrollments,
      total,
      page,
      limit,
    };
  } catch (error) {
    logger.error(
      {
        query,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error listing topic enrollments",
    );
    throw error;
  }
}

export async function listTopicSubscriptionsHandler(
  query: TopicEnrollmentQuery,
  organizationId: string,
): Promise<TopicEnrollmentListResponse> {
  return await listTopicEnrollments(query, organizationId);
}

