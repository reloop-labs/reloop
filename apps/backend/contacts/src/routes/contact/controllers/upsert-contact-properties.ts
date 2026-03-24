import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger as globalLogger, type Logger } from "@reloop/logger";
import { and, eq, inArray } from "drizzle-orm";

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
    "Adding properties to contact",
  );

  try {
    logger.info({ propertyNames }, "searching for existing properties");
    const existingProperties = await db
      .select()
      .from(schema.contactProperty)
      .where(
        and(
          inArray(schema.contactProperty.propertyName, propertyNames),
          eq(schema.contactProperty.organizationId, organizationId),
        ),
      );
    const propertyNameToId = new Map(existingProperties.map((p) => [p.propertyName, p.id]));
    logger.info({ ...propertyNameToId }, "Property name to ID map");
    for (const [name, value] of Object.entries(properties)) {
      let propertyId = propertyNameToId.get(name);
      if (!propertyId) {
        logger.info({ name }, "Creating new property definition");
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
        logger.info({ name, id: propertyId }, "Checking if property value already exists for this contact");
        const existingValue = await db.query.contactPropertyValue.findFirst({
          where: and(
            eq(schema.contactPropertyValue.contactId, contactId),
            eq(schema.contactPropertyValue.propertyId, propertyId),
          ),
        });

        if (existingValue) {
          logger.info({ name, id: propertyId }, "Updating existing property value");
          await db
            .update(schema.contactPropertyValue)
            .set({ value: value, updatedAt: new Date() })
            .where(eq(schema.contactPropertyValue.id, existingValue.id));

          logger.info({ name, id: propertyId }, "Updated existing property value");
        } else {
          logger.info({ name, id: propertyId }, "Inserting new property value");
          await db.insert(schema.contactPropertyValue).values({
            contactId,
            propertyId,
            value,
            organizationId,
            userId,
          });
          logger.info({ name, id: propertyId }, "Inserted new property value");
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
