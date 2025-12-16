import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { formatApiKeyResponse } from "@reloop/api-key/routes/api-key/controllers/format-api-key-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq } from "drizzle-orm";

export async function listApiKeys(
	query: ApiKeyTypes.ApiKeyListQuery,
	organizationId: string,
	userId: string,
): Promise<ApiKeyTypes.ApiKeyListResponse> {
	const { page = 1, limit = 10, enabled } = query;
	const offset = (page - 1) * limit;


	try {
		const conditions = [eq(schema.apikey.organizationId, organizationId)];
		if (enabled !== undefined) {
			conditions.push(eq(schema.apikey.enabled, enabled));
		}
		const whereClause = and(...conditions);

		const totalResult = await db
			.select({ count: count() })
			.from(schema.apikey)
			.where(whereClause);
		const total = totalResult[0]?.count || 0;

		const result = await db.query.apikey.findMany({
			where: whereClause,
			orderBy: desc(schema.apikey.createdAt),
			limit: limit,
			offset: offset,
			with: { user: true },
		});


		return {
			apiKeys: result.map((apiKey) => {
				const { user, ...apiKeyData } = apiKey;
				return formatApiKeyResponse({
					...apiKeyData,
					createdBy: {
						id: user.id,
						name: user.name,
						image: user.image,
						email: user.email,
					},
				});
			}),
			total,
			page,
			limit,
		};
	} catch (error) {
		logger.error(
			{
				query,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error listing API keys",
		);
		throw error;
	}
}

export async function listApiKeysHandler(
	query: ApiKeyTypes.ApiKeyListQuery,
	organizationId: string,
	userId: string,
): Promise<ApiKeyTypes.ApiKeyListResponse> {
	logger.info({ query, organizationId, userId }, "Listing API keys");

	try {
		const result = await listApiKeys(query, organizationId, userId);
		logger.info(
			{ query, organizationId, userId },
			"API keys listed successfully",
		);
		return result;
	} catch (error) {
		logger.error(
			{
				query,
				organizationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error listing API keys",
		);
		throw error;
	}
}
