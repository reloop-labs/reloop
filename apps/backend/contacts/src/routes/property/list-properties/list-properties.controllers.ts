import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, desc, eq, ilike, isNull, type SQL, sql } from "drizzle-orm";

export const listPropertiesController = async ({
  activeOrganizationId,
  query,
  logger,
}: {
  activeOrganizationId: string;
  query: PropertyTypes.PropertyListQuery;
  logger: Logger;
}): Promise<PropertyTypes.PropertyListResponse> => {
  const page = query.page || 1;
  const limit = Math.min(query.limit || 100, 100);
  const offset = (page - 1) * limit;

  logger.info({ page, limit }, "Listing properties");

  try {
    const whereConditions: Array<SQL<unknown>> = [
      eq(schema.contactProperty.organizationId, activeOrganizationId),
      isNull(schema.contactProperty.deletedAt),
    ];

    if (query.type) {
      whereConditions.push(eq(schema.contactProperty.propertyType, query.type));
    }
    if (query.search) {
      whereConditions.push(
        ilike(schema.contactProperty.propertyName, `%${query.search}%`),
      );
    }

    const rows = await db
      .select({
        property: schema.contactProperty,
        total: sql<number>`COUNT(*) OVER()`,
      })
      .from(schema.contactProperty)
      .where(and(...whereConditions))
      .orderBy(desc(schema.contactProperty.createdAt))
      .limit(limit)
      .offset(offset);

    logger.info(
      { total: rows[0]?.total ?? 0, page, limit },
      "Properties listed successfully",
    );
    return {
      object: "contact_property",
      properties: rows.map((r) => ({ ...r.property, object: "contact_property" })),
      total: Number(rows[0]?.total ?? 0),
      page,
      limit,
    };
  } catch (error) {
    logger.error({ error }, "Debug listing properties");
    throw error;
  }
};
