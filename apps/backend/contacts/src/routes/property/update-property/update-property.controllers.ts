import { formatPropertyResponse } from "@be/contacts/routes/property/format-property-response";
import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const updatePropertyController = async ({
  activeOrganizationId,
  property_id,
  body,
  logger,
}: {
  activeOrganizationId: string;
  property_id: string;
  body: { fallbackValue: string | null };
  logger: Logger;
}): Promise<PropertyTypes.PropertyResponse> => {
  logger.info({ property_id, fallbackValue: body.fallbackValue }, "Updating property");

  try {
    const existingProperty = await db
      .select()
      .from(schema.contactProperty)
      .where(
        and(
          eq(schema.contactProperty.id, property_id),
          eq(schema.contactProperty.organizationId, activeOrganizationId),
          isNull(schema.contactProperty.deletedAt),
        ),
      )
      .limit(1);

    if (existingProperty.length === 0) {
      logger.warn({ property_id }, "Property not found");
      throw status(404, { message: "Property not found" });
    }

    const [updatedProperty] = await db
      .update(schema.contactProperty)
      .set({ defaultValue: body.fallbackValue, updatedAt: new Date() })
      .where(eq(schema.contactProperty.id, property_id))
      .returning();

    if (!updatedProperty) {
      logger.error({ property_id }, "Failed to update property - no data returned");
      throw status(500, { message: "Failed to update property" });
    }

    logger.info({ property_id }, "Property updated successfully");
    return formatPropertyResponse(updatedProperty);
  } catch (error) {
    logger.error({ property_id, error }, "Debug updating property");
    throw error;
  }
};
