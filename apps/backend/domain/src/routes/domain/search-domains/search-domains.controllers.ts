import type { DomainTypes } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, count, desc, eq, isNull, like } from "drizzle-orm";

export async function searchDomainsController({
  searchTerm,
  query,
  logger,
}: {
  searchTerm: string;
  query: Omit<DomainTypes.DomainQuery, "organizationId" | "userId">;
  logger: Logger;
}): Promise<DomainTypes.DomainListResponse> {
  const { page = 1, limit = 10, status } = query;
  const offset = (page - 1) * limit;

  logger.info({ searchTerm, page, limit, status }, "Searching domains");

  try {
    const conditions = [
      like(schema.domain.domain, `%${searchTerm}%`),
      isNull(schema.domain.deletedAt),
    ];
    if (status !== undefined) conditions.push(eq(schema.domain.status, status));
    const whereClause = and(...conditions);
    const totalResult = await db
      .select({ count: count() })
      .from(schema.domain)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const domains = await db.query.domain.findMany({
      where: whereClause,
      orderBy: desc(schema.domain.createdAt),
      limit: limit,
      offset: offset,
      with: {
        dnsRecords: true,
      },
    });

    logger.info(
      {
        searchTerm,
        total,
        page,
        limit,
        count: domains.length,
      },
      "Domain search completed",
    );

    return {
      domains,
      total,
      page,
      limit,
    };
  } catch (error) {
    logger.error(
      {
        searchTerm,
        query,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error searching domains",
    );
    throw error;
  }
}
