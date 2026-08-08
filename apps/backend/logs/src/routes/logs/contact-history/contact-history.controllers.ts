import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { LogsModel } from "@reloop/logs/model/logs.model";
import { and, count, desc, eq, inArray, type SQL } from "drizzle-orm";
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
				// Tie-break equal timestamps so offset pages never skip/duplicate rows
				.orderBy(
					desc(schema.activityLog.createdAt),
					desc(schema.activityLog.id),
				)
				.limit(limit)
				.offset(offset),
		]);

		const total = Number(totalResult?.count || 0);

		// Resolve actor display names in bulk (user ids + api key ids)
		const userIds = [
			...new Set(
				rows
					.filter((r) => r.actorType === "user" && r.actorId)
					.map((r) => r.actorId as string),
			),
		];
		const apiKeyIds = [
			...new Set(
				rows
					.filter((r) => r.actorType === "api_key" && r.actorId)
					.map((r) => r.actorId as string),
			),
		];

		const [users, apiKeys] = await Promise.all([
			userIds.length > 0
				? db
						.select({
							id: schema.user.id,
							name: schema.user.name,
							email: schema.user.email,
							image: schema.user.image,
						})
						.from(schema.user)
						.where(inArray(schema.user.id, userIds))
				: Promise.resolve(
						[] as {
							id: string;
							name: string;
							email: string;
							image: string | null;
						}[],
					),
			apiKeyIds.length > 0
				? db
						.select({
							id: schema.apikey.id,
							name: schema.apikey.name,
						})
						.from(schema.apikey)
						.where(inArray(schema.apikey.id, apiKeyIds))
				: Promise.resolve([] as { id: string; name: string | null }[]),
		]);

		const userById = new Map(users.map((u) => [u.id, u]));
		const apiKeyById = new Map(apiKeys.map((k) => [k.id, k]));

		const data = rows.map((row) => {
			const action = row.action || row.event.split(".").pop() || "updated";
			const metadata = (row.metadata as Record<string, unknown> | null) ?? null;
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

			let actorName: string | null = null;
			let actorImage: string | null = null;

			if (row.actorType === "user" && row.actorId) {
				const u = userById.get(row.actorId);
				if (u) {
					actorName = u.name?.trim() || u.email || null;
					actorImage = u.image ?? null;
				}
			} else if (row.actorType === "api_key" && row.actorId) {
				const k = apiKeyById.get(row.actorId);
				actorName = k?.name?.trim() || "API key";
			} else if (row.actorType === "system") {
				actorName = "System";
			}

			return {
				id: row.id,
				event: row.event,
				action,
				createdAt: row.createdAt.toISOString(),
				actorType: row.actorType || null,
				actorId: row.actorId ?? null,
				actorName,
				actorImage,
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
