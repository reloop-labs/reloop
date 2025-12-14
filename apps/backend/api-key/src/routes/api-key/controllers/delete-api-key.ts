import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function deleteApiKey(
	apiKeyId: string,
	organizationId: string,
	userId: string,
): Promise<void> {
	logger.info({ apiKeyId, organizationId, userId }, "Deleting API key");

	try {
		// Check if API key exists and belongs to user/organization
		const existing = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, apiKeyId),
				eq(schema.apikey.organizationId, organizationId),
				eq(schema.apikey.userId, userId),
			),
		});

		if (!existing) {
			logger.warn({ apiKeyId }, "API key not found");
			throw status(404, { message: "API key not found" });
		}

		// Hard delete the API key
		await db
			.delete(schema.apikey)
			.where(
				and(
					eq(schema.apikey.id, apiKeyId),
					eq(schema.apikey.organizationId, organizationId),
					eq(schema.apikey.userId, userId),
				),
			);

		logger.info({ apiKeyId }, "API key deleted successfully");
	} catch (error) {
		logger.error(
			{
				apiKeyId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting API key",
		);
		throw error;
	}
}

export async function deleteApiKeyHandler(
	apiKeyId: string,
	organizationId: string,
	userId: string,
): Promise<{ message: string }> {
	logger.info({ apiKeyId, organizationId, userId }, "Deleting API key");

	try {
		await deleteApiKey(apiKeyId, organizationId, userId);
		logger.info(
			{ apiKeyId, organizationId, userId },
			"API key deleted successfully",
		);
		return { message: "API key deleted successfully" };
	} catch (error) {
		logger.error(
			{
				apiKeyId,
				organizationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting API key",
		);
		throw error;
	}
}
