import type { LogsTypes } from "@reloop/logs/types/logs.type";
import {
	getClickHouseClient,
	type StoredLogEntry,
} from "@reloop/logs/utils/clickhouse";
import {
	formatClickHouseDate,
	safeJsonParse,
	toClickHouseDate,
} from "@reloop/logs/utils/format";
import { useLogger } from "evlog/elysia";

export async function listLogsController(
	query: LogsTypes.ListLogsQuery,
	organizationId: string,
): Promise<LogsTypes.ListLogsResponse> {
	const log = useLogger();
	log.info("Listing logs", { query });
	try {
		const client = getClickHouseClient();
		const conditions: string[] = [];
		const params: Record<string, string | number> = {};

		if (query.level) {
			conditions.push("level = {level:String}");
			params.level = query.level;
		}

		if (query.status_code) {
			const statuses = query.status_code.split(",");
			const statusConditions: string[] = [];
			let statusIdx = 0;
			for (const status of statuses) {
				if (status === "successes") {
					statusConditions.push("(status_code >= 200 AND status_code < 400)");
				} else if (status === "errors") {
					statusConditions.push("(status_code >= 400)");
				} else {
					const numericStatus = Number.parseInt(status, 10);
					if (!Number.isNaN(numericStatus)) {
						const paramName = `statusCode${statusIdx++}`;
						statusConditions.push(`status_code = {${paramName}:Int32}`);
						params[paramName] = numericStatus;
					}
				}
			}
			if (statusConditions.length > 0) {
				conditions.push(`(${statusConditions.join(" OR ")})`);
			}
		}

		if (query.event) {
			conditions.push("event ILIKE {eventPattern:String}");
			params.eventPattern = `%${query.event}%`;
		}

		if (query.search) {
			conditions.push(
				"(event ILIKE {searchPattern:String} OR metadata ILIKE {searchPattern:String})",
			);
			params.searchPattern = `%${query.search}%`;
		}

		conditions.push("organization_id = {organizationId:String}");
		params.organizationId = organizationId;

		if (query.start_date) {
			conditions.push("created_at >= {startDate:String}");
			params.startDate = toClickHouseDate(query.start_date);
		}

		if (query.end_date) {
			conditions.push("created_at <= {endDate:String}");
			params.endDate = toClickHouseDate(query.end_date);
		}

		// Audit-log filters
		if (query.service) {
			conditions.push("service = {service:String}");
			params.service = query.service;
		}
		if (query.action) {
			conditions.push("action = {action:String}");
			params.action = query.action;
		}
		if (query.resource_type) {
			conditions.push("resource_type = {resourceType:String}");
			params.resourceType = query.resource_type;
		}
		if (query.resource_id) {
			conditions.push("resource_id = {resourceId:String}");
			params.resourceId = query.resource_id;
		}
		if (query.actor_type) {
			conditions.push("actor_type = {actorType:String}");
			params.actorType = query.actor_type;
		}
		if (query.actor_id) {
			conditions.push("actor_id = {actorId:String}");
			params.actorId = query.actor_id;
		}
		if (query.environment) {
			conditions.push("environment = {environment:String}");
			params.environment = query.environment;
		}

		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
		const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
		const page = Math.max(Number(query.page || 1), 1);
		const offset = (page - 1) * limit;

		const queryParams = { ...params, limit, offset };

		// Run count, data, and stats queries in parallel
		const [countResultSet, dataResultSet, statsResultSet] = await Promise.all([
			client.query({
				query: `SELECT count() as total FROM logs ${whereClause}`,
				query_params: queryParams,
				format: "JSONEachRow",
			}),
			client.query({
				query: `
					SELECT
						id,
						event,
						level,
						trace_id,
						user_id,
						organization_id,
						metadata,
						request_details,
						request_body,
						status_code,
						toString(created_at) AS created_at,
						actor_type,
						actor_id,
						resource_type,
						resource_id,
						service,
						action,
						ip_address,
						user_agent,
						environment
					FROM logs
					${whereClause}
					ORDER BY created_at DESC
					LIMIT {limit:UInt32} OFFSET {offset:UInt32}
				`,
				query_params: queryParams,
				format: "JSONEachRow",
			}),
			client.query({
				query: `
					SELECT
						level,
						count() as cnt
					FROM logs
					${whereClause}
					GROUP BY level
				`,
				query_params: queryParams,
				format: "JSONEachRow",
			}),
		]);

		const countRows = (await countResultSet.json()) as { total: string }[];
		const totalCount = Number(countRows[0]?.total || 0);

		const rows = (await dataResultSet.json()) as StoredLogEntry[];

		const statsRows = (await statsResultSet.json()) as {
			level: string;
			cnt: string;
		}[];

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
			trace_id: row.trace_id,
			metadata: safeJsonParse(row.metadata, {}),
			status_code: row.status_code,
			created_at: formatClickHouseDate(row.created_at),
			requestDetails: safeJsonParse(row.request_details, {}),
			request_body: safeJsonParse(row.request_body, {}),
			// Audit-log fields — normalise empty strings back to null for the API response
			actor_type: row.actor_type || null,
			actor_id: row.actor_id || null,
			resource_type: row.resource_type || null,
			resource_id: row.resource_id || null,
			service: row.service || null,
			action: row.action || null,
			ip_address: row.ip_address || null,
			user_agent: row.user_agent || null,
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
