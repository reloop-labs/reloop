import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { LogsErrors } from "@reloop/logs/error/logs.error-response";
import type { LogsModel } from "@reloop/logs/model/logs.model";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function getEmailLogController({
	id,
	organizationId,
}: {
	id: string;
	organizationId: string;
}): Promise<LogsModel.EmailLogFullEntry> {
	const log = useLogger();
	log.info("Getting email log details", { id, organizationId });
	try {
		const emailLogEntry = await db.query.emailLog.findFirst({
			where: and(
				eq(schema.emailLog.id, id),
				eq(schema.emailLog.organizationId, organizationId),
			),
			with: {
				events: {
					orderBy: (events, { asc }) => [asc(events.createdAt)],
				},
			},
		});

		if (!emailLogEntry) {
			log.warn("Email log not found", { id, organizationId });
			throw LogsErrors.emailLogNotFound(id);
		}

		log.info("Email log details retrieved successfully", { id });
		return {
			...emailLogEntry,
			sentAt: emailLogEntry.sentAt?.toISOString() || null,
			deliveredAt: emailLogEntry.deliveredAt?.toISOString() || null,
			failedAt: emailLogEntry.failedAt?.toISOString() || null,
			createdAt: emailLogEntry.createdAt.toISOString(),
			updatedAt: emailLogEntry.updatedAt.toISOString(),
			events: (emailLogEntry.events || []).map((event) => ({
				id: event.id,
				type: event.type as string,
				metadata: event.metadata ?? null,
				createdAt: event.createdAt.toISOString(),
			})),
		} as LogsModel.EmailLogFullEntry;
	} catch (error) {
		log.error("Error fetching email log details", {
			id,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
