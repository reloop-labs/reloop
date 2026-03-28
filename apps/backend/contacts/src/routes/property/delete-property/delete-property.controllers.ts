import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export const deletePropertyController = async ({
  activeOrganizationId,
  property_id,
  logger,
}: {
  activeOrganizationId: string;
  property_id: string;
  logger: Logger;
}): Promise<{ object: "contact_property"; success: boolean }> => {
  logger.info({ property_id }, "Deleting property");

  try {
    const existingProperty = await db
      .select()
      .from(schema.contactProperty)
      .where(
        and(
          eq(schema.contactProperty.id, property_id),
          eq(schema.contactProperty.organizationId, activeOrganizationId),
        ),
      )
      .limit(1);

    if (existingProperty.length === 0) {
      logger.warn({ property_id }, "Property not found");
      throw status(404, { message: "Property not found" });
    }

    await db
      .delete(schema.contactProperty)
      .where(eq(schema.contactProperty.id, property_id));

    logger.info({ property_id }, "Property deleted successfully");
    return { object: "contact_property", success: true };
  } catch (error) {
    logger.error({ property_id, error }, "Debug deleting property");
    throw error;
  }
};
