import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, count, desc, eq } from "drizzle-orm";

export async function listApiKeysController({
	query,
	organizationId,
	logger,
}: {
	query: ApiKeyTypes.ApiKeyListQuery;
	organizationId: string;
	logger: Logger;
}): Promise<ApiKeyTypes.ApiKeyListResponse> {
	const { page = 1, limit = 10, enabled } = query;
	const offset = (page - 1) * limit;
	logger.info({ query }, "Getting API keys");
	try {
		const conditions = [eq(schema.apikey.organizationId, organizationId)];
		if (enabled !== undefined) conditions.push(eq(schema.apikey.enabled, enabled));
		const whereClause = and(...conditions);
		logger.info({ whereClause }, "Getting Total Count");
		const totalResult = await db
			.select({ count: count() })
			.from(schema.apikey)
			.where(whereClause);
		const total = totalResult[0]?.count || 0;
		logger.info({ total }, "Total Count");
		const result = await db.query.apikey.findMany({
			where: whereClause,
			orderBy: desc(schema.apikey.createdAt),
			limit: limit,
			offset: offset,
			with: { user: true },
		});
		logger.info({ result }, "API keys");
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
				};
			}),
			total,
			page,
			limit,
		};
	} catch (error) {
		logger.error({ query, error }, "Error listing API keys");
		throw error;
	}
}
