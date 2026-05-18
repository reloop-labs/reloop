import type { GroupModel } from "@be/contacts/model/group.model";
import type {
	GroupListItem,
	GroupListResponse,
} from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { GROUP_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, desc, eq, ilike, isNull, sql } from "drizzle-orm";

export const listGroupsController = async ({
	organizationId,
	page: rawPage,
	limit: rawLimit,
	search,
	logger,
}: {
	organizationId: string;
	page?: number;
	limit?: number;
	search?: string;
	logger?: any;
}): Promise<GroupListResponse | GroupModel.Unauthorized> => {
	const page = rawPage || 1;
	const limit = Math.min(rawLimit || 100, 100);
	const offset = (page - 1) * limit;

	logger?.info("Listing groups", { page, limit, search });

	try {
		const whereClause = and(
			eq(schema.group.organizationId, organizationId),
			isNull(schema.group.deletedAt),
			search ? ilike(schema.group.name, `%${search}%`) : undefined,
		);

		const rows = await db
			.select({
				group: schema.group,
				total: sql<number>`COUNT(*) OVER()`,
			})
			.from(schema.group)
			.where(whereClause)
			.orderBy(desc(schema.group.createdAt))
			.limit(limit)
			.offset(offset);

		return {
			object: "contact_group",
			groups: rows.map((r) => ({
				id: r.group.id,
				name: r.group.name,
				createdAt: r.group.createdAt,
				updatedAt: r.group.updatedAt,
			})),
			total: Number(rows[0]?.total ?? 0),
			page,
			limit,
			event: GROUP_LIST_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		logger?.error("Debug listing groups", { error });
		throw error;
	}
};
