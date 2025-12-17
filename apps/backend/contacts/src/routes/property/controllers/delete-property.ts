import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteProperty(
  organizationId: string,
  propertyId: string,
): Promise<{ success: boolean }> {
  logger.info(
    {
      propertyId,
      organizationId,
    },
    "Deleting property",
  );

  try {
    // Check if property exists
    const existingProperty = await db
      .select()
      .from(schema.property)
      .where(
        and(
          eq(schema.property.id, propertyId),
          eq(schema.property.organizationId, organizationId),
          isNull(schema.property.deletedAt),
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

    // Soft delete
    await db
      .update(schema.property)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.property.id, propertyId));

    logger.info(
      { propertyId },
      "Property deleted successfully",
    );

    return { success: true };
  } catch (error) {
    logger.error(
      {
        propertyId,
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error deleting property",
    );
    throw error;
  }
}

export async function deletePropertyHandler(
  organizationId: string,
  propertyId: string,
): Promise<{ success: boolean }> {
  return deleteProperty(organizationId, propertyId);
}
