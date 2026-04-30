import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { verifyToken } from "../token.utils";


export async function getPreferencesDataController({
  token,
  logger,
}: {
  token: string;
  logger: Logger;
}) {
  logger.info("Fetching preferences data");

  const payload = await verifyToken(token);
  if (!payload) {
    throw status(401, { message: "Invalid or expired preferences token" });
  }

  const { contactId, organizationId } = payload;

  // Fetch contact
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

  // Fetch organization name
  const [org] = await db
    .select({ name: schema.organization.name })
    .from(schema.organization)
    .where(eq(schema.organization.id, organizationId))
    .limit(1);


  // Fetch all PUBLIC topics for the org
  const topics = await db.query.topic.findMany({
    where: and(
      eq(schema.topic.organizationId, organizationId),
      eq(schema.topic.visibility, "public"),
      isNull(schema.topic.deletedAt),
    ),
  });

  // Fetch contact's enrollments for those topics
  const enrollments = await db.query.topicEnrollment.findMany({
    where: and(
      eq(schema.topicEnrollment.contactId, contactId),
      eq(schema.topicEnrollment.organizationId, organizationId),
      isNull(schema.topicEnrollment.deletedAt),
    ),
  });

  const enrollmentMap = new Map(enrollments.map((e) => [e.topicId, e.status]));

  logger.info(
    { contactId, topicsCount: topics.length },
    "Preferences data fetched successfully",
  );

  return {
    contact: {
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
    },
    organization: {
      name: org?.name ?? "Reloop",
    },
    topics: topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      defaultSubscription: topic.defaultSubscription,
      // enrolled | unenrolled | none (never touched)
      status: enrollmentMap.get(topic.id) ?? "none",
    })),
  };
}
