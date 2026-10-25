import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import {
	afterCursor,
	cursorOrderBy,
	decodeCursor,
	toCursorPage,
} from "@reloop/db/pagination";
import * as schema from "@reloop/db/schema";
import { PROPERTY_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, ilike, isNull, type SQL, sql } from "drizzle-orm";
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
	// With a cursor, pagination is keyset-based and `page` is ignored.
	const position = query.cursor ? decodeCursor(query.cursor) : null;
	const offset = position ? 0 : (page - 1) * limit;

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

		// COUNT(*) OVER() runs before LIMIT but after WHERE, so the cursor
		// condition is applied separately to keep `total` the full match count.
		const filtered = and(...whereConditions);
		const [totalResult, rows] = await Promise.all([
			db
				.select({ total: sql<number>`COUNT(*)` })
				.from(schema.contactProperty)
				.where(filtered),
			db
				.select({
					property: schema.contactProperty,
					createdAt: schema.contactProperty.createdAt,
					id: schema.contactProperty.id,
				})
				.from(schema.contactProperty)
				.where(
					position
						? and(filtered, afterCursor(schema.contactProperty, position))
						: filtered,
				)
				.orderBy(...cursorOrderBy(schema.contactProperty))
				.limit(limit + 1)
				.offset(offset),
		]);
		const { items, hasMore, nextCursor } = toCursorPage(rows, limit);
		const total = Number(totalResult[0]?.total ?? 0);

		log.info("Properties listed successfully", {
			total,
			page,
			limit,
		});
		return {
			object: "contact_property",
			properties: items.map((r) => ({
				id: r.property.id,
				propertyName: r.property.propertyName,
				propertyType: r.property.propertyType,
				defaultValue: r.property.defaultValue,
				createdAt: r.property.createdAt,
				updatedAt: r.property.updatedAt,
			})),
			total,
			page,
			limit,
			hasMore,
			nextCursor,
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
