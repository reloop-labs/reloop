import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupTypes } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, ilike, sql } from "drizzle-orm";

export const listGroups = async ({
	query,
	activeOrganizationId,
	logger,
}: {
	query: GroupModel.GroupQuery;
	activeOrganizationId: string;
	logger: Logger;
}): Promise<GroupTypes.GroupListResponse | GroupModel.Unauthorized> => {
	const { page = 1, limit = 100, search } = query;
	const offset = (page - 1) * limit;

	logger.info(
		{ organizationId: activeOrganizationId, page, limit, search },
		"Listing groups",
	);

	try {
		const whereClause = and(
			eq(schema.group.organizationId, activeOrganizationId),
			search ? ilike(schema.group.name, `%${search}%`) : undefined,
		);

		const [groups, countResult] = await Promise.all([
			db.query.group.findMany({
				where: whereClause,
				limit,
				offset,
				orderBy: (groups, { desc }) => [desc(groups.createdAt)],
			}),
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.group)
				.where(whereClause),
		]);

		const count = countResult[0]?.count ?? 0;

		const groupResponses = groups.map(
			(group) =>
				({
					...group,
					object: "contact_group" as const,
				}) as GroupTypes.GroupResponse,
		);

		return {
			object: "contact_group" as const,
			groups: groupResponses,
			total: Number(count),
			page,
			limit,
		};
	} catch (error) {
		logger.error(`Error listing groups: ${error}`);
		throw error;
	}
};

export async function listGroupsHandler(
	params: {
		organizationId: string;
		page?: number;
		limit?: number;
		search?: string;
	},
	logger: Logger,
): Promise<GroupTypes.GroupListResponse> {
	return (await listGroups({
		query: {
			page: params.page,
			limit: params.limit,
			search: params.search,
		},
		activeOrganizationId: params.organizationId,
		logger,
	})) as GroupTypes.GroupListResponse;
}
