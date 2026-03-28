import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getContactController({
  contactId,
  organizationId,
  logger,
}: {
  contactId: string;
  organizationId: string;
  logger: Logger;
}): Promise<ContactTypes.ContactResponse> {
  logger.info({ contactId, organizationId }, "Getting contact");

  try {
    const contact = await db.query.contact.findFirst({
      where: and(
        eq(schema.contact.id, contactId),
        eq(schema.contact.organizationId, organizationId),
        isNull(schema.contact.deletedAt),
      ),
      with: {
        propertyValues: {
          with: { property: true },
          where: isNull(schema.contactPropertyValue.deletedAt),
        },
        contactGroups: {
          with: { group: true },
          where: isNull(schema.contactGroup.deletedAt),
        },
        contactTopics: {
          with: { topic: true },
          where: isNull(schema.topicEnrollment.deletedAt),
        },
      },
    });

    if (!contact) {
      logger.warn({ contactId, organizationId }, "Contact not found");
      throw status(404, { message: "Contact not found" });
    }

    // Map property values to Record<string, string>
    const properties = contact.propertyValues.reduce(
      (acc, pv) => {
        acc[pv.property.propertyName] = pv.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    // Map contactGroups join rows to { id, name }
    const groups = contact.contactGroups
      .filter((cg) => cg.group !== null)
      .map((cg) => ({ id: cg.group.id, name: cg.group.name }));

    // Map enrollments to { id, name, subscription }
    const topics = contact.contactTopics
      .filter((en) => en.topic !== null && en.topic.deletedAt === null)
      .map((en) => ({
        id: en.topic.id,
        name: en.topic.name,
        subscription: (en.status === "enrolled" ? "opt_in" : "opt_out") as
          | "opt_in"
          | "opt_out",
      }));

    logger.info(
      {
        contactId,
        organizationId,
        propertyCount: contact.propertyValues.length,
        groupCount: groups.length,
        topicCount: topics.length,
      },
      "Contact retrieved successfully",
    );

    return {
      object: "contact",
      id: contact.id,
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      status: contact.status,
      properties: properties ?? {},
      groups: groups ?? [],
      topics: topics ?? [],
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  } catch (error) {
    logger.error(
      {
        contactId,
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error getting contact",
    );
    throw error;
  }
}
