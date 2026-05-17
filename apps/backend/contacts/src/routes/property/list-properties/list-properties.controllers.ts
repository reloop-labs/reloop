import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { PROPERTY_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, desc, eq, ilike, isNull, type SQL, sql } from "drizzle-orm";
import { log } from "evlog";

export const listPropertiesController = async ({
	activeOrganizationId,
	query,
	logger,
}: {
	activeOrganizationId: string;
	query: PropertyTypes.PropertyListQuery;
	logger?: any;
}): Promise<PropertyTypes.PropertyListResponse> => {
	const page = query.page || 1;
	const limit = Math.min(query.limit || 100, 100);
	const offset = (page - 1) * limit;

	log.info({ ...{ page, limit }, message: "Listing properties" });

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

		log.info({
			...{ total: rows[0]?.total ?? 0, page, limit },
			message: "Properties listed successfully",
		});
		return {
			object: "contact_property",
			properties: rows.map((r) => ({
				id: r.property.id,
				propertyName: r.property.propertyName,
				propertyType: r.property.propertyType,
				defaultValue: r.property.defaultValue,
				createdAt: r.property.createdAt,
				updatedAt: r.property.updatedAt,
			})),
			total: Number(rows[0]?.total ?? 0),
			page,
			limit,
			event: PROPERTY_LIST_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error({ ...{ error }, message: "Debug listing properties" });
		throw error;
	}
};
