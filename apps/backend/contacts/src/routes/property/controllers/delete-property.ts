import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
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
      .from(schema.contactProperty)
      .where(
        and(
          eq(schema.contactProperty.id, propertyId),
          eq(schema.contactProperty.organizationId, organizationId),
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

    // Hard delete - actually remove the record
    await db
      .delete(schema.contactProperty)
      .where(eq(schema.contactProperty.id, propertyId));

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
