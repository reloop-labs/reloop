import type { PropertyTypes } from "@be/contacts/types/property.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { PROPERTY_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export const createPropertyController = async ({
  activeOrganizationId,
  userId,
  body,
  logger,
  cookie,
  requestDetails,
}: {
  activeOrganizationId: string;
  userId: string;
  body: PropertyTypes.CreatePropertyRequest;
  logger: Logger;
  cookie?: string;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
    statusCode?: number;
  };
}): Promise<PropertyTypes.PropertyResponse> => {
  logger.info({ name: body.name, type: body.type }, "Creating property");

  try {
    const existingProperty = await db
      .select()
      .from(schema.contactProperty)
      .where(
        and(
          eq(schema.contactProperty.propertyName, body.name),
          eq(schema.contactProperty.organizationId, activeOrganizationId),
        ),
      )
      .limit(1);

    if (existingProperty.length > 0) {
      logger.warn(
        { name: body.name },
        "Property already exists in this organization",
      );
      throw status(409, { message: "Property already exists" });
    }

    const [newProperty] = await db
      .insert(schema.contactProperty)
      .values({
        propertyName: body.name,
        propertyType: body.type,
        defaultValue: body.fallbackValue || null,
        organizationId: activeOrganizationId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newProperty) {
      logger.error(
        { name: body.name },
        "Failed to create property - no data returned",
      );
      throw status(500, { message: "Failed to create property" });
    }

    logger.info(
      { name: body.name, id: newProperty.id },
      "Property created successfully",
    );

    const result = {
      ...newProperty,
      object: "contact_property" as const,
      event: PROPERTY_CREATE_WEBHOOK_EVENT.id,
    };

    await createLog({
      event: PROPERTY_CREATE_WEBHOOK_EVENT.id,
      cookie,
      metadata: result,
      requestDetails: { ...(requestDetails || {}), statusCode: 201 },
    });

    return result;
  } catch (error) {
    logger.error({ name: body.name, error }, "Debug creating property");
    throw error;
  }
};
