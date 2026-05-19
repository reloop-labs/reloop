import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { PROPERTY_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, desc, eq, ilike, isNull, type SQL, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const listPropertiesController = async ({
	organizationId,
	query,
}: {
	organizationId: string;
	query: PropertyTypes.PropertyListQuery;
}): Promise<PropertyTypes.PropertyListResponse> => {
	const log = useLogger();
	const page = query.page || 1;
	const limit = Math.min(query.limit || 100, 100);
	const offset = (page - 1) * limit;

	log.info("Listing properties", { page, limit });

	try {
		const whereConditions: Array<SQL<unknown>> = [
			eq(schema.contactProperty.organizationId, organizationId),
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

		log.info("Properties listed successfully", {
			total: rows[0]?.total ?? 0,
			page,
			limit,
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
		log.error("Debug listing properties", {
			error: error instanceof Error ? error.message : String(error),
		});
		if (isAppError(error)) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
};
