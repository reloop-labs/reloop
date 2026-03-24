import { type DatabaseInstance, db as defaultDb } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger as globalLogger, type Logger } from "@reloop/logger";
import { and, eq, inArray, isNull } from "drizzle-orm";
export async function upsertContactProperties(
  contactId: string,
  organizationId: string,
  userId: string,
  properties: Record<string, string | number>,
  logger: Logger = globalLogger,
  db: DatabaseInstance = defaultDb,
): Promise<void> {
  const propertyNames = Object.keys(properties);

  // Validate property names
  const propertyNameRegex = /^[a-z0-9_]+$/;
  for (const name of propertyNames) {
    if (!propertyNameRegex.test(name)) {
      logger.warn({ name }, "Invalid property name");
      throw new Error(
        `Invalid property name: '${name}'. Property names must be lowercase and contain only alphanumeric characters and underscores.`,
      );
    }
  }

  logger.info(
    { contactId, organizationId, propertyCount: propertyNames.length },
    "Upserting properties for contact (replacement mode)",
  );

  try {
    // 1. Fetch all existing active property values for this contact
    const currentValues = await db
      .select({
        id: schema.contactPropertyValue.id,
        propertyName: schema.contactProperty.propertyName,
      })
      .from(schema.contactPropertyValue)
      .innerJoin(
        schema.contactProperty,
        eq(schema.contactPropertyValue.propertyId, schema.contactProperty.id),
      )
      .where(
        and(
          eq(schema.contactPropertyValue.contactId, contactId),
          eq(schema.contactPropertyValue.organizationId, organizationId),
          isNull(schema.contactPropertyValue.deletedAt),
        ),
      );

    // 2. Identify properties to delete (in DB but NOT in request)
    const propertiesToDelete = currentValues.filter(
      (cv: any) => !propertyNames.includes(cv.propertyName),
    );

    if (propertiesToDelete.length > 0) {
      logger.info(
        { count: propertiesToDelete.length },
        "Soft-deleting properties not in request",
      );
      await db
        .update(schema.contactPropertyValue)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(
          inArray(
            schema.contactPropertyValue.id,
            propertiesToDelete.map((p: any) => p.id),
          ),
        );
    }

    if (propertyNames.length === 0) return;

    // 3. Process incoming properties (update or insert)
    const existingProperties = await db
      .select({
        id: schema.contactProperty.id,
        propertyName: schema.contactProperty.propertyName,
        propertyType: schema.contactProperty.propertyType,
      })
      .from(schema.contactProperty)
      .where(
        and(
          inArray(schema.contactProperty.propertyName, propertyNames),
          eq(schema.contactProperty.organizationId, organizationId),
          isNull(schema.contactProperty.deletedAt),
        ),
      );

    const propertyInfo = new Map<string, { id: string; type: "string" | "number" }>(
      existingProperties.map((p) => [
        p.propertyName,
        { id: p.id, type: p.propertyType as "string" | "number" },
      ]),
    );

    for (const [name, value] of Object.entries(properties)) {
      let info = propertyInfo.get(name);
      const incomingType = typeof value === "number" ? "number" : "string";

      if (!info) {
        logger.info({ name, incomingType }, "Creating new property definition");
        const [newProp] = await db
          .insert(schema.contactProperty)
          .values({
            propertyName: name,
            propertyType: incomingType,
            organizationId,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        if (newProp) {
          info = { id: newProp.id, type: newProp.propertyType as "string" | "number" };
          propertyInfo.set(name, info);
        }
      }

      if (info) {
        // Validate type compatibility
        if (incomingType !== info.type) {
          logger.warn(
            { name, expected: info.type, received: incomingType },
            "Property type mismatch",
          );
          throw new Error(
            `Property '${name}' expected type '${info.type}' but received '${incomingType}'`,
          );
        }

        const pid = info.id;
        const stringValue = String(value);

        // Find existing value record (even if soft-deleted) to update/restore it
        const existingValue = await db.query.contactPropertyValue.findFirst({
          where: and(
            eq(schema.contactPropertyValue.contactId, contactId),
            eq(schema.contactPropertyValue.propertyId, pid),
            eq(schema.contactPropertyValue.organizationId, organizationId),
          ),
        });

        if (existingValue) {
          logger.info({ name, id: pid }, "Updating existing property value");
          await db
            .update(schema.contactPropertyValue)
            .set({
              value: stringValue,
              updatedAt: new Date(),
              deletedAt: null, // Restore if it was soft-deleted
            })
            .where(eq(schema.contactPropertyValue.id, existingValue.id));
        } else {
          logger.info({ name, id: pid }, "Inserting new property value");
          await db.insert(schema.contactPropertyValue).values({
            contactId,
            propertyId: pid,
            value: stringValue,
            organizationId,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
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
