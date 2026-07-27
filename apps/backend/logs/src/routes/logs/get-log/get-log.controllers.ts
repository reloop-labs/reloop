import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { LogsErrors } from "@reloop/logs/error/logs.error-response";
import type { LogsModel } from "@reloop/logs/model/logs.model";
import { formatLogDate } from "@reloop/logs/utils/format";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { getEmailLogController } from "../get-email-log/get-email-log.controllers";

export async function getLogController(
	logId: string,
	organizationId: string,
): Promise<LogsModel.LogDetailResponse> {
	const log = useLogger();
	log.info("Getting log entry", { logId });
	try {
		const [row] = await db
			.select()
			.from(schema.activityLog)
			.where(
				and(
					eq(schema.activityLog.id, logId),
					eq(schema.activityLog.organizationId, organizationId),
				),
			)
			.limit(1);

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
		const metadata = (row.metadata ?? {}) as LogMetadata;
		const emailId =
			metadata.emailId || metadata.email_id || metadata.email_log_id;
		let emailDetails = null;

		if (emailId && typeof emailId === "string" && row.organizationId) {
			try {
				emailDetails = await getEmailLogController({
					id: emailId,
					organizationId: row.organizationId,
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
			trace_id: row.traceId,
			metadata,
			created_at: formatLogDate(row.createdAt),
			requestDetails: row.requestDetails ?? {},
			request_body: row.requestBody ?? {},
			status_code: row.statusCode || null,
			email: emailDetails || undefined,
			actor_type: row.actorType || null,
			actor_id: row.actorId || null,
			resource_type: row.resourceType || null,
			resource_id: row.resourceId || null,
			service: row.service || null,
			action: row.action || null,
			ip_address: row.ipAddress || null,
			user_agent: row.userAgent || null,
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
