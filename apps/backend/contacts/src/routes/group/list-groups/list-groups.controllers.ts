import type { GroupModel } from "@be/contacts/model/group.model";
import type {
  GroupListItem,
  GroupListResponse,
} from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, desc, eq, ilike, sql } from "drizzle-orm";

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
}): Promise<GroupListResponse | GroupModel.Unauthorized> => {
  const page = rawPage || 1;
  const limit = Math.min(rawLimit || 100, 100);
  const offset = (page - 1) * limit;

  logger.info({ page, limit, search }, "Listing groups");

  try {
    const whereClause = and(
      eq(schema.group.organizationId, organizationId),
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
      groups: rows.map((r) => r.group) as GroupListItem[],
      total: Number(rows[0]?.total ?? 0),
      page,
      limit,
    };
  } catch (error) {
    logger.error({ error }, "Debug listing groups");
    throw error;
  }
};
