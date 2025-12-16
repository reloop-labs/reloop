import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { formatApiKeyResponse } from "@reloop/api-key/routes/api-key/controllers/format-api-key-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function getApiKey(
	apiKeyId: string,
	organizationId: string,
): Promise<ApiKeyTypes.ApiKeyResponse> {
	logger.info({ apiKeyId, organizationId }, "Getting API key");

	try {
		const result = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, apiKeyId),
				eq(schema.apikey.organizationId, organizationId),
			),
			with: { user: true },
		});

		if (!result) {
			logger.warn({ apiKeyId }, "API key not found");
			throw status(404, { message: "API key not found" });
		}

		const { user, ...apiKeyData } = result;
		logger.info({ apiKeyId }, "API key retrieved successfully");
		return formatApiKeyResponse({
			...apiKeyData,
			createdBy: {
				id: user.id,
				name: user.name,
				image: user.image,
				email: user.email,
			},
		});
	} catch (error) {
		logger.error(
			{
				apiKeyId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting API key",
		);
		throw error;
	}
}

export async function getApiKeyHandler(
	apiKeyId: string,
	organizationId: string,
	userId: string,
): Promise<ApiKeyTypes.ApiKeyResponse> {
	logger.info({ apiKeyId, organizationId, userId }, "Getting API key");

	try {
		const apiKey = await getApiKey(apiKeyId, organizationId);
		logger.info(
			{ apiKeyId, organizationId, userId },
			"API key retrieved successfully",
		);
		return apiKey;
	} catch (error) {
		logger.error(
			{
				apiKeyId,
				organizationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting API key",
		);
		throw error;
	}
}
