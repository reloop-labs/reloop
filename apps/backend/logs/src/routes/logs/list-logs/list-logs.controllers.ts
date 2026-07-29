import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { LogsTypes } from "@reloop/logs/types/logs.type";
import { formatLogDate } from "@reloop/logs/utils/format";
import {
	and,
	count,
	desc,
	eq,
	gte,
	ilike,
	lte,
	or,
	type SQL,
	sql,
} from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function listLogsController(
	query: LogsTypes.ListLogsQuery,
	organizationId: string,
): Promise<LogsTypes.ListLogsResponse> {
	const log = useLogger();
	log.info("Listing logs", { query });
	try {
		const conditions: SQL[] = [
			eq(schema.activityLog.organizationId, organizationId),
		];

		if (query.level) {
			conditions.push(eq(schema.activityLog.level, query.level));
		}

		if (query.status_code) {
			const statuses = query.status_code.split(",");
			const statusConditions: SQL[] = [];
			for (const status of statuses) {
				if (status === "successes") {
					statusConditions.push(
						and(
							gte(schema.activityLog.statusCode, 200),
							sql`${schema.activityLog.statusCode} < 400`,
						) as SQL,
					);
				} else if (status === "errors") {
					statusConditions.push(gte(schema.activityLog.statusCode, 400));
				} else {
					const numericStatus = Number.parseInt(status, 10);
					if (!Number.isNaN(numericStatus)) {
						statusConditions.push(
							eq(schema.activityLog.statusCode, numericStatus),
						);
					}
				}
			}
			if (statusConditions.length > 0) {
				conditions.push(or(...statusConditions) as SQL);
			}
		}

		if (query.event) {
			conditions.push(ilike(schema.activityLog.event, `%${query.event}%`));
		}

		if (query.search) {
			const pattern = `%${query.search}%`;
			conditions.push(
				or(
					ilike(schema.activityLog.event, pattern),
					sql`${schema.activityLog.metadata}::text ILIKE ${pattern}`,
				) as SQL,
			);
		}

		if (query.start_date) {
			conditions.push(
				gte(schema.activityLog.createdAt, new Date(query.start_date)),
			);
		}

		if (query.end_date) {
			conditions.push(
				lte(schema.activityLog.createdAt, new Date(query.end_date)),
			);
		}

		if (query.service) {
			conditions.push(eq(schema.activityLog.service, query.service));
		}
		if (query.action) {
			conditions.push(eq(schema.activityLog.action, query.action));
		}
		if (query.resource_type) {
			conditions.push(eq(schema.activityLog.resourceType, query.resource_type));
		}
		if (query.resource_id) {
			conditions.push(eq(schema.activityLog.resourceId, query.resource_id));
		}
		if (query.actor_type) {
			conditions.push(eq(schema.activityLog.actorType, query.actor_type));
		}
		if (query.actor_id) {
			conditions.push(eq(schema.activityLog.actorId, query.actor_id));
		}
		if (query.environment) {
			conditions.push(eq(schema.activityLog.environment, query.environment));
		}

		const whereClause = and(...conditions);
		const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
		const page = Math.max(Number(query.page || 1), 1);
		const offset = (page - 1) * limit;

		const [countRow, rows, statsRows] = await Promise.all([
			db
				.select({ total: count() })
				.from(schema.activityLog)
				.where(whereClause)
				.then((result) => result[0]),
			db
				.select()
				.from(schema.activityLog)
				.where(whereClause)
				.orderBy(desc(schema.activityLog.createdAt))
				.limit(limit)
				.offset(offset),
			db
				.select({
					level: schema.activityLog.level,
					cnt: count(),
				})
				.from(schema.activityLog)
				.where(whereClause)
				.groupBy(schema.activityLog.level),
		]);

		const totalCount = Number(countRow?.total || 0);

		const stats = {
			debug: 0,
			info: 0,
			warn: 0,
			error: 0,
			fatal: 0,
		};
		for (const row of statsRows) {
			const level = row.level as keyof typeof stats;
			if (level in stats) {
				stats[level] = Number(row.cnt);
			}
		}

		const logs = rows.map((row) => ({
			uuid: row.id,
			event: row.event,
			level: row.level,
			trace_id: row.traceId,
			metadata: row.metadata ?? {},
			status_code: row.statusCode,
			created_at: formatLogDate(row.createdAt),
			requestDetails: row.requestDetails ?? {},
			request_body: row.requestBody ?? {},
			actor_type: row.actorType || null,
			actor_id: row.actorId || null,
			resource_type: row.resourceType || null,
			resource_id: row.resourceId || null,
			service: row.service || null,
			action: row.action || null,
			ip_address: row.ipAddress || null,
			user_agent: row.userAgent || null,
			environment: row.environment || null,
		}));

		log.info("Logs listed successfully", {
			count: logs.length,
			total: totalCount,
		});
		return {
			logs,
			count: totalCount,
			stats,
		};
	} catch (error) {
		log.error("Error listing logs", {
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
