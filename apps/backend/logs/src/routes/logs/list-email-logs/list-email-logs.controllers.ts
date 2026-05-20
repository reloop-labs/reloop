import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { LogsModel } from "@reloop/logs/model/logs.model";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

type EmailStatus = (typeof schema.emailStatusEnum.enumValues)[number];

export async function listEmailLogsController({
	query,
	organizationId,
}: {
	query: LogsModel.ListEmailLogsQuery;
	organizationId: string;
}): Promise<LogsModel.ListEmailLogsResponse> {
	const log = useLogger();
	const { page = 1, limit = 10, search, status } = query;
	const offset = (page - 1) * limit;

	log.info("Listing email logs", { query, organizationId });
	try {
		const conditions: SQL[] = [
			eq(schema.emailLog.organizationId, organizationId),
		];

		if (status) {
			conditions.push(eq(schema.emailLog.status, status as EmailStatus));
		}

		if (search) {
			conditions.push(
				or(
					ilike(schema.emailLog.subject, `%${search}%`),
					ilike(schema.emailLog.fromEmail, `%${search}%`),
				) as SQL,
			);
		}

		const whereClause = and(...conditions);
		if (!whereClause) {
			throw new Error("Where clause is required");
		}

		const totalResult = await db
			.select({ count: count() })
			.from(schema.emailLog)
			.where(whereClause);

		const total = totalResult[0]?.count || 0;

		const logs = await db.query.emailLog.findMany({
			where: whereClause,
			orderBy: desc(schema.emailLog.createdAt),
			limit: limit,
			offset: offset,
		});

		log.info("Email logs listed successfully", { count: logs.length, total });
		return {
			object: "list",
			data: logs.map((log) => ({
				...log,
				createdAt: log.createdAt.toISOString(),
			})),
			total,
			page,
			limit,
		};
	} catch (error) {
		log.error("Error listing email logs", {
			query,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
