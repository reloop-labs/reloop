import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { verifyToken } from "../token.utils";

export async function updatePreferenceController({
  token,
  topicId,
  subscribe,
  logger,
}: {
  token: string;
  topicId: string;
  subscribe: boolean;
  logger: Logger;
}) {
  logger.info({ topicId, subscribe }, "Updating preference");

  const payload = await verifyToken(token);
  if (!payload) {
    throw status(401, { message: "Invalid or expired preferences token" });
  }

  const { contactId, organizationId } = payload;

  // Verify the topic exists, is public, and belongs to this org
  const topic = await db.query.topic.findFirst({
    where: and(
      eq(schema.topic.id, topicId),
      eq(schema.topic.organizationId, organizationId),
      eq(schema.topic.visibility, "public"),
      isNull(schema.topic.deletedAt),
    ),
  });

  if (!topic) {
    throw status(404, { message: "Topic not found or not accessible" });
  }

  const targetStatus = subscribe ? "enrolled" : "unenrolled";

  const existing = await db.query.topicEnrollment.findFirst({
    where: and(
      eq(schema.topicEnrollment.contactId, contactId),
      eq(schema.topicEnrollment.topicId, topicId),
      isNull(schema.topicEnrollment.deletedAt),
    ),
  });

  if (existing) {
    await db
      .update(schema.topicEnrollment)
      .set({ status: targetStatus, updatedAt: new Date() })
      .where(eq(schema.topicEnrollment.id, existing.id));
  } else {
    await db.insert(schema.topicEnrollment).values({
      contactId,
      topicId,
      organizationId,
      status: targetStatus,
    });
  }

  logger.info({ contactId, topicId, status: targetStatus }, "Preference updated");

  return {
    success: true,
    topicId,
    status: targetStatus,
  };
}
