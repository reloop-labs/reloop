import type { LogsModel } from "@reloop/logs/model/logs.model";
import {
	getClickHouseClient,
	type StoredLogEntry,
} from "@reloop/logs/utils/clickhouse";
import {
	escapeString,
	formatClickHouseDate,
	safeJsonParse,
} from "@reloop/logs/utils/format";
import { status } from "elysia";
import { getEmailLogController } from "../get-email-log/get-email-log.controllers";

export async function getLogController(
	logId: string,
): Promise<LogsModel.LogEntryResponse> {
	try {
		const client = getClickHouseClient();

		const resultSet = await client.query({
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
				WHERE id = '${escapeString(logId)}'
				LIMIT 1
			`,
			format: "JSONEachRow",
		});

		const rows = (await resultSet.json()) as StoredLogEntry[];
		const row = rows[0];

		if (!row) {
			throw status(404, {
				message: "Log not found",
			});
		}

		const metadata = safeJsonParse(row.metadata, {}) as any;
		const emailId =
			metadata.emailId || metadata.email_id || metadata.email_log_id;
		let emailDetails = null;

		if (emailId && typeof emailId === "string" && row.organization_id) {
			try {
				emailDetails = await getEmailLogController({
					id: emailId,
					organizationId: row.organization_id,
				});
			} catch {
				// Silently fail email enrichment
			}
		}

		return {
			uuid: row.id,
			event: row.event,
			level: row.level,
			trace_id: row.trace_id,
			metadata,
			created_at: formatClickHouseDate(row.created_at),
			requestDetails: safeJsonParse(row.request_details, {}),
			status_code: row.status_code || null,
			email: emailDetails || undefined,
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
		};
	} catch (error) {
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}

		throw status(500, {
			message:
				error instanceof Error ? error.message : "Failed to retrieve log",
		});
	}
}
