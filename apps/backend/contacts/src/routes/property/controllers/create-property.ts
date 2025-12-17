import { formatPropertyResponse } from "@be/contacts/routes/property/controllers/format-property-response";
import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createProperty(
  organizationId: string,
  body: PropertyTypes.CreatePropertyRequest,
): Promise<PropertyTypes.PropertyResponse> {
  logger.info(
    {
      name: body.name,
      type: body.type,
      organizationId,
    },
    "Creating property",
  );

  try {
    // Check if property with same name already exists in this organization
    const existingProperty = await db
      .select()
      .from(schema.property)
      .where(
        and(
          eq(schema.property.name, body.name),
          eq(schema.property.organizationId, organizationId),
          isNull(schema.property.deletedAt),
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
      .insert(schema.property)
      .values({
        name: body.name,
        type: body.type,
        fallbackValue: body.fallbackValue || null,
        organizationId,
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
      {
        name: body.name,
        id: newProperty.id,
      },
      "Property created successfully",
    );

    return formatPropertyResponse(newProperty);
  } catch (error) {
    logger.error(
      {
        name: body.name,
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error creating property",
    );
    throw error;
  }
}

export async function createPropertyHandler(
  organizationId: string,
  body: PropertyTypes.CreatePropertyRequest,
): Promise<PropertyTypes.PropertyResponse> {
  return createProperty(organizationId, body);
}
