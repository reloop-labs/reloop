import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { LogsModel } from "@reloop/logs/model/logs.model";
import { and, count, desc, eq, type SQL, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function contactActivityController({
	query,
	organizationId,
}: {
	query: LogsModel.ContactActivityQuery;
	organizationId: string;
}): Promise<LogsModel.ContactActivityResponse> {
	const log = useLogger();
	const { email, page = 1, limit = 10 } = query;
	const offset = (page - 1) * limit;

	log.info("Fetching contact activity", { email, organizationId, page, limit });

	try {
		const conditions: SQL[] = [
			eq(schema.emailLog.organizationId, organizationId),
			// Postgres jsonb array-contains: to_emails @> '["addr"]'::jsonb
			sql`${schema.emailLog.toEmails} @> ${JSON.stringify([email])}::jsonb` as SQL,
		];

		const whereClause = and(...conditions)!;

		// Total count
		const totalResult = await db
			.select({ count: count() })
			.from(schema.emailLog)
			.where(whereClause);

		const total = totalResult[0]?.count || 0;

		// Fetch email logs with their event timelines
		const logs = await db.query.emailLog.findMany({
			where: whereClause,
			orderBy: desc(schema.emailLog.createdAt),
			limit,
			offset,
			with: {
				events: {
					orderBy: (events, { asc }) => [asc(events.createdAt)],
				},
			},
		});

		log.info("Contact activity fetched", { email, count: logs.length, total });

		return {
			object: "contact_activity",
			email,
			data: logs.map((entry) => ({
				id: entry.id,
				subject: entry.subject,
				fromEmail: entry.fromEmail,
				toEmails: entry.toEmails as string[],
				status: entry.status,
				sentAt: entry.sentAt?.toISOString() ?? null,
				deliveredAt: entry.deliveredAt?.toISOString() ?? null,
				failedAt: entry.failedAt?.toISOString() ?? null,
				errorMessage: entry.errorMessage ?? null,
				createdAt: entry.createdAt.toISOString(),
				events: (entry.events || []).map((ev) => ({
					id: ev.id,
					type: ev.type as string,
					metadata: ev.metadata ?? null,
					createdAt: ev.createdAt.toISOString(),
				})),
			})),
			total,
			page,
			limit,
		};
	} catch (error) {
		log.error("Error fetching contact activity", {
			email,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
