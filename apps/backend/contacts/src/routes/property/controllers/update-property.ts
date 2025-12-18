import { formatPropertyResponse } from "@be/contacts/routes/property/controllers/format-property-response";
import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function updateProperty(
  organizationId: string,
  propertyId: string,
  body: { fallbackValue: string | null },
): Promise<PropertyTypes.PropertyResponse> {
  logger.info(
    {
      propertyId,
      organizationId,
      fallbackValue: body.fallbackValue,
    },
    "Updating property",
  );

  try {
    // Check if property exists and belongs to organization
    const existingProperty = await db
      .select()
      .from(schema.contactProperty)
      .where(
        and(
          eq(schema.contactProperty.id, propertyId),
          eq(schema.contactProperty.organizationId, organizationId),
          isNull(schema.contactProperty.deletedAt),
        ),
      )
      .limit(1);

    if (existingProperty.length === 0) {
      logger.warn(
        { propertyId },
        "Property not found",
      );
      throw status(404, { message: "Property not found" });
    }

    // Update the fallback value
    const [updatedProperty] = await db
      .update(schema.contactProperty)
      .set({
        defaultValue: body.fallbackValue,
        updatedAt: new Date(),
      })
      .where(eq(schema.contactProperty.id, propertyId))
      .returning();

    if (!updatedProperty) {
      logger.error(
        { propertyId },
        "Failed to update property - no data returned",
      );
      throw status(500, { message: "Failed to update property" });
    }

    logger.info(
      {
        propertyId,
        fallbackValue: body.fallbackValue,
      },
      "Property updated successfully",
    );

    return formatPropertyResponse(updatedProperty);
  } catch (error) {
    logger.error(
      {
        propertyId,
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating property",
    );
    throw error;
  }
}

export async function updatePropertyHandler(
  organizationId: string,
  propertyId: string,
  body: { fallbackValue: string | null },
): Promise<PropertyTypes.PropertyResponse> {
  return updateProperty(organizationId, propertyId, body);
}
