import { log } from "evlog";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

import type { LogsModel } from "@reloop/logs/model/logs.model";
import { and, eq } from "drizzle-orm";

export async function getEmailLogController({
	id,
	organizationId,
}: {
	id: string;
	organizationId: string;
}): Promise<LogsModel.EmailLogFullEntry | null> {
	try {
		const log = await db.query.emailLog.findFirst({
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

		if (!log) return null;

		return {
			...log,
			sentAt: log.sentAt?.toISOString() || null,
			deliveredAt: log.deliveredAt?.toISOString() || null,
			failedAt: log.failedAt?.toISOString() || null,
			createdAt: log.createdAt.toISOString(),
			updatedAt: log.updatedAt.toISOString(),
			events: (log.events || []).map((event) => ({
				id: event.id,
				type: event.type as string,
				metadata: event.metadata ?? null,
				createdAt: event.createdAt.toISOString(),
			})),
		} as LogsModel.EmailLogFullEntry;
	} catch (error) {
		log.error({
				id,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error fetching email log details",
		);
		throw error;
	}
}
