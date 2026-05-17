import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { log } from "evlog";

export async function listApiKeysController({
	query,
	organizationId,
	logger,
}: {
	query: ApiKeyTypes.ApiKeyListQuery;
	organizationId: string;
	logger?: any;
}): Promise<ApiKeyTypes.ApiKeyListResponse> {
	const { page = 1, limit = 10, enabled, userId, q } = query;
	const offset = (page - 1) * limit;
	log.info({ ...{ query }, message: "Getting API keys" });
	try {
		const conditions = [eq(schema.apikey.organizationId, organizationId)];
		if (enabled !== undefined)
			conditions.push(eq(schema.apikey.enabled, enabled));
		if (userId !== undefined) conditions.push(eq(schema.apikey.userId, userId));
		if (q !== undefined && q !== "") {
			const searchCondition = or(
				ilike(schema.apikey.name, `%${q}%`),
				ilike(schema.apikey.start, `%${q}%`),
				ilike(schema.apikey.prefix, `%${q}%`),
			);
			if (searchCondition) {
				conditions.push(searchCondition);
			}
		}
		const whereClause = and(...conditions);
		log.info({ ...{ whereClause }, message: "Getting Total Count" });
		const totalResult = await db
			.select({ count: count() })
			.from(schema.apikey)
			.where(whereClause);
		const total = totalResult[0]?.count || 0;
		log.info({ ...{ total }, message: "Total Count" });
		const result = await db.query.apikey.findMany({
			where: whereClause,
			orderBy: desc(schema.apikey.createdAt),
			limit: limit,
			offset: offset,
			with: { user: true },
		});
		log.info({ ...{ result }, message: "API keys" });
		return {
			apiKeys: result.map((apiKey) => {
				const { user, ...apiKeyData } = apiKey;
				return {
					id: apiKeyData.id,
					name: apiKeyData.name,
					start: apiKeyData.start,
					prefix: apiKeyData.prefix,
					organizationId: apiKeyData.organizationId,
					userId: apiKeyData.userId,
					refillInterval: apiKeyData.refillInterval,
					refillAmount: apiKeyData.refillAmount,
					lastRefillAt: apiKeyData.lastRefillAt?.toISOString() ?? null,
					enabled: apiKeyData.enabled,
					rateLimitEnabled: apiKeyData.rateLimitEnabled,
					rateLimitTimeWindow: apiKeyData.rateLimitTimeWindow,
					rateLimitMax: apiKeyData.rateLimitMax,
					requestCount: apiKeyData.requestCount,
					remaining: apiKeyData.remaining,
					lastRequest: apiKeyData.lastRequest?.toISOString() ?? null,
					expiresAt: apiKeyData.expiresAt?.toISOString() ?? null,
					createdAt: apiKeyData.createdAt.toISOString(),
					updatedAt: apiKeyData.updatedAt.toISOString(),
					permissions: apiKeyData.permissions,
					metadata: apiKeyData.metadata,
					createdBy: {
						id: user.id,
						name: user.name,
						image: user.image,
						email: user.email,
					},
					object: "api_key" as const,
					event: API_KEY_LIST_WEBHOOK_EVENT.id,
				};
			}),
			total,
			page,
			limit,
			object: "api_key" as const,
			event: API_KEY_LIST_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error({ ...{ query, error }, message: "Error listing API keys" });
		throw error;
	}
}
