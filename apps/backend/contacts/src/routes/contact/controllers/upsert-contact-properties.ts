import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger as globalLogger, type Logger } from "@reloop/logger";
import { and, eq, inArray } from "drizzle-orm";

/**
 * Resolves property names to IDs (creating them if they don't exist)
 * and upserts the property values for a specific contact.
 */
export async function upsertContactProperties(
  contactId: string,
  organizationId: string,
  userId: string,
  properties: Record<string, string>,
  logger: Logger = globalLogger,
): Promise<void> {
  if (Object.keys(properties).length === 0) return;

  const propertyNames = Object.keys(properties);

  logger.info(
    { contactId, organizationId, propertyCount: propertyNames.length },
    "Upserting contact properties",
  );

  try {
    // 1. Fetch existing properties for this organization
    const existingProperties = await db
      .select()
      .from(schema.contactProperty)
      .where(
        and(
          inArray(schema.contactProperty.propertyName, propertyNames),
          eq(schema.contactProperty.organizationId, organizationId),
        ),
      );

    const propertyNameToId = new Map(
      existingProperties.map((p) => [p.propertyName, p.id]),
    );

    // 2. Process each property from the request
    for (const [name, value] of Object.entries(properties)) {
      let propertyId = propertyNameToId.get(name);

      if (!propertyId) {
        // Create new property definition if it doesn't exist
        const [newProp] = await db
          .insert(schema.contactProperty)
          .values({
            propertyName: name,
            propertyType: "string",
            organizationId,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        if (newProp) {
          propertyId = newProp.id;
          propertyNameToId.set(name, propertyId);
          logger.info({ name, id: propertyId }, "Created new property definition");
        }
      }

      if (propertyId) {
        // Check if property value already exists for this contact
        const existingValue = await db.query.contactPropertyValue.findFirst({
          where: and(
            eq(schema.contactPropertyValue.contactId, contactId),
            eq(schema.contactPropertyValue.propertyId, propertyId),
          ),
        });

        if (existingValue) {
          // Update existing property value
          await db
            .update(schema.contactPropertyValue)
            .set({
              value: value,
              updatedAt: new Date(),
            })
            .where(eq(schema.contactPropertyValue.id, existingValue.id));
        } else {
          // Insert new property value
          await db.insert(schema.contactPropertyValue).values({
            contactId,
            propertyId,
            value,
            organizationId,
            userId,
          });
        }
      }
    }
  } catch (error) {
    logger.error(
      {
        contactId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error upserting contact properties",
    );
    throw error;
  }
}
