import { LogsErrors } from "@reloop/logs/error/logs.error-response";
import type { LogsModel } from "@reloop/logs/model/logs.model";
import {
	getClickHouseClient,
	type StoredLogEntry,
} from "@reloop/logs/utils/clickhouse";
import {
	formatClickHouseDate,
	safeJsonParse,
} from "@reloop/logs/utils/format";
import { useLogger } from "evlog/elysia";
import { getEmailLogController } from "../get-email-log/get-email-log.controllers";

export async function getLogController(
	logId: string,
	organizationId: string,
): Promise<LogsModel.LogDetailResponse> {
	const log = useLogger();
	log.info("Getting log entry", { logId });
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
				WHERE id = {logId:String} AND organization_id = {organizationId:String}
				LIMIT 1
			`,
			query_params: { logId, organizationId },
			format: "JSONEachRow",
		});

		const rows = (await resultSet.json()) as StoredLogEntry[];
		const row = rows[0];

		if (!row) {
			log.warn("Log not found", { logId });
			throw LogsErrors.notFound(logId);
		}

		interface LogMetadata {
			emailId?: string;
			email_id?: string;
			email_log_id?: string;
			[key: string]: unknown;
		}
		const metadata = safeJsonParse(row.metadata, {}) as LogMetadata;
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

		log.info("Log entry retrieved successfully", { logId });
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
		log.error("Error getting log entry", {
			logId,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
