import type { TopicEnrollmentModel } from "@be/contacts/model/topic-enrollment.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import logger from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

type TopicEnrollmentResponse = TopicEnrollmentModel.TopicEnrollmentResponse;

export async function createTopicEnrollment(params: {
  organizationId: string;
  contactId: string;
  topicId: string;
  enrollmentStatus?: "enrolled" | "unenrolled";
}): Promise<TopicEnrollmentResponse> {
  const { organizationId, contactId, topicId, enrollmentStatus = "enrolled" } = params;

  try {
    // Check if enrollment already exists
    const existingEnrollment = await db.query.topicSubscription.findFirst({
      where: and(
        eq(schema.topicSubscription.contactId, contactId),
        eq(schema.topicSubscription.topicId, topicId),
        isNull(schema.topicSubscription.deletedAt),
      ),
    });

    if (existingEnrollment) {
      throw status(409, { message: "Contact is already enrolled in this topic" });
    }

    // Verify contact exists
    const contact = await db.query.contact.findFirst({
      where: and(
        eq(schema.contact.id, contactId),
        eq(schema.contact.organizationId, organizationId),
        isNull(schema.contact.deletedAt),
      ),
    });

    if (!contact) {
      throw status(404, { message: "Contact not found" });
    }

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

    const [newEnrollment] = await db
      .insert(schema.topicSubscription)
      .values({
        contactId,
        topicId,
        organizationId,
        status: enrollmentStatus,
      })
      .returning();

    if (!newEnrollment) {
      throw new Error("Failed to create topic enrollment");
    }

    return newEnrollment;
  } catch (error) {
    logger.error(
      {
        contactId,
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error creating topic enrollment",
    );
    throw error;
  }
}

export async function createTopicSubscriptionHandler(params: {
  organizationId: string;
  contactId: string;
  topicId: string;
  subscriptionStatus?: "enrolled" | "unenrolled";
}): Promise<TopicEnrollmentResponse> {
  return await createTopicEnrollment({
    organizationId: params.organizationId,
    contactId: params.contactId,
    topicId: params.topicId,
    enrollmentStatus: params.subscriptionStatus,
  });
}

