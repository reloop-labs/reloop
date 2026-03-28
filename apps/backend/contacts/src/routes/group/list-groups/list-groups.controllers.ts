import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupTypes } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, ilike, sql } from "drizzle-orm";

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
  logger: Logger;
}): Promise<GroupTypes.GroupListResponse | GroupModel.Unauthorized> => {
  const page = rawPage || 1;
  const limit = Math.min(rawLimit || 100, 100);
  const offset = (page - 1) * limit;

  logger.info(
    { organizationId, page, limit, search },
    "Listing groups",
  );

  try {
    const whereClause = and(
      eq(schema.group.organizationId, organizationId),
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

    return {
      object: "contact_group" as const,
      groups: groups as unknown as GroupTypes.GroupListItem[],
      total: Number(count),
      page,
      limit,
    };
  } catch (error) {
    logger.error(`Error listing groups: ${error}`);
    throw error;
  }
};
