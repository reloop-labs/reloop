import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { LogsModel } from "@reloop/logs/model/logs.model";
import { and, count, desc, eq, type SQL } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import {
	resolveContactHistoryChanges,
	summaryFromChanges,
	titleForContactAction,
} from "./contact-history.helpers";

export async function contactHistoryController({
	contactId,
	organizationId,
	query,
}: {
	contactId: string;
	organizationId: string;
	query: LogsModel.ContactHistoryQuery;
}): Promise<LogsModel.ContactHistoryResponse> {
	const log = useLogger();
	const page = Math.max(Number(query.page || 1), 1);
	const limit = Math.min(Math.max(Number(query.limit || 20), 1), 50);
	const offset = (page - 1) * limit;

	log.info("Fetching contact history", {
		contactId,
		organizationId,
		page,
		limit,
	});

	try {
		const conditions: SQL[] = [
			eq(schema.activityLog.organizationId, organizationId),
			eq(schema.activityLog.resourceType, "contact"),
			eq(schema.activityLog.resourceId, contactId),
			eq(schema.activityLog.level, "info"),
		];
		const whereClause = and(...conditions);

		const [totalResult, rows] = await Promise.all([
			db
				.select({ count: count() })
				.from(schema.activityLog)
				.where(whereClause)
				.then((r) => r[0]),
			db
				.select()
				.from(schema.activityLog)
				.where(whereClause)
				.orderBy(desc(schema.activityLog.createdAt))
				.limit(limit)
				.offset(offset),
		]);

		const total = Number(totalResult?.count || 0);

		const data = rows.map((row) => {
			const action = row.action || row.event.split(".").pop() || "updated";
			const metadata =
				(row.metadata as Record<string, unknown> | null) ?? null;
			const requestBody =
				(row.requestBody as Record<string, unknown> | null) ?? null;
			const requestDetails =
				(row.requestDetails as Record<string, unknown> | null) ?? null;

			const changes = resolveContactHistoryChanges(
				action,
				metadata,
				requestBody,
				requestDetails,
			);

			return {
				id: row.id,
				event: row.event,
				action,
				createdAt: row.createdAt.toISOString(),
				actorType: row.actorType || null,
				actorId: row.actorId ?? null,
				title: titleForContactAction(action),
				summary: summaryFromChanges(changes),
				changes,
				requestBody,
				metadata: metadata ?? {},
			};
		});

		log.info("Contact history fetched", {
			contactId,
			count: data.length,
			total,
		});

		return {
			object: "contact_history",
			contactId,
			data,
			total,
			page,
			limit,
		};
	} catch (error) {
		log.error("Error fetching contact history", {
			contactId,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
