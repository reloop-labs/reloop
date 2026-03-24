import { formatPropertyResponse } from "@be/contacts/routes/property/controllers/format-property-response";
import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, count, desc, eq, ilike, isNull, type SQL } from "drizzle-orm";

export async function listProperties(
  organizationId: string,
  query: PropertyTypes.PropertyListQuery,
  logger: Logger,
): Promise<PropertyTypes.PropertyListResponse> {
  logger.info(
    {
      organizationId,
      query,
    },
    "Listing properties",
  );

  try {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: Array<SQL<unknown>> = [
      eq(schema.contactProperty.organizationId, organizationId),
      isNull(schema.contactProperty.deletedAt),
    ];

    // Filter by type
    if (query.type) {
      whereConditions.push(eq(schema.contactProperty.propertyType, query.type));
    }

    // Search by name
    if (query.search) {
      whereConditions.push(ilike(schema.contactProperty.propertyName, `%${query.search}%`));
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(schema.contactProperty)
      .where(and(...whereConditions));

    const total = totalResult[0]?.count || 0;

    // Get properties
    const properties = await db
      .select()
      .from(schema.contactProperty)
      .where(and(...whereConditions))
      .orderBy(desc(schema.contactProperty.createdAt))
      .limit(limit)
      .offset(offset);

    const formattedProperties = properties.map(formatPropertyResponse);

    logger.info(
      {
        organizationId,
        total,
        page,
        limit,
      },
      "Properties listed successfully",
    );

    return {
      properties: formattedProperties,
      total,
      page,
      limit,
    };
  } catch (error) {
    logger.error(
      {
        organizationId,
        query,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error listing properties",
    );
    throw error;
  }
}

export async function listPropertiesHandler(
  organizationId: string,
  query: PropertyTypes.PropertyListQuery,
  logger: Logger,
): Promise<PropertyTypes.PropertyListResponse> {
  return listProperties(organizationId, query, logger);
}
