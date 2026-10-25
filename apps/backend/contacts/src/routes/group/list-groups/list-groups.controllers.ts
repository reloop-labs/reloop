import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupListResponse } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import {
	afterCursor,
	cursorOrderBy,
	decodeCursor,
	toCursorPage,
} from "@reloop/db/pagination";
import * as schema from "@reloop/db/schema";
import { GROUP_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, ilike, isNull, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const listGroupsController = async ({
	organizationId,
	page: rawPage,
	limit: rawLimit,
	search,
	cursor,
}: {
	organizationId: string;
	page?: number;
	limit?: number;
	search?: string;
	cursor?: string;
}): Promise<GroupListResponse | GroupModel.Unauthorized> => {
	const log = useLogger();
	const page = rawPage || 1;
	const limit = Math.min(rawLimit || 100, 100);
	// With a cursor, pagination is keyset-based and `page` is ignored.
	const position = cursor ? decodeCursor(cursor) : null;
	const offset = position ? 0 : (page - 1) * limit;

	log.info("Listing groups", { page, limit, search });

	try {
		const whereClause = and(
			eq(schema.group.organizationId, organizationId),
			isNull(schema.group.deletedAt),
			search ? ilike(schema.group.name, `%${search}%`) : undefined,
		);

		// Counted separately: COUNT(*) OVER() would only see rows after the cursor.
		const [totalResult, rows] = await Promise.all([
			db
				.select({ total: sql<number>`COUNT(*)` })
				.from(schema.group)
				.where(whereClause),
			db
				.select({
					group: schema.group,
					createdAt: schema.group.createdAt,
					id: schema.group.id,
				})
				.from(schema.group)
				.where(
					position
						? and(whereClause, afterCursor(schema.group, position))
						: whereClause,
				)
				.orderBy(...cursorOrderBy(schema.group))
				.limit(limit + 1)
				.offset(offset),
		]);
		const { items, hasMore, nextCursor } = toCursorPage(rows, limit);

		return {
			object: "contact_group",
			groups: items.map((r) => ({
				id: r.group.id,
				name: r.group.name,
				createdAt: r.group.createdAt,
				updatedAt: r.group.updatedAt,
			})),
			total: Number(totalResult[0]?.total ?? 0),
			page,
			limit,
			hasMore,
			nextCursor,
			event: GROUP_LIST_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error("Debug listing groups", {
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
