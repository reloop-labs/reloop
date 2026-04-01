import { createLog } from "@reloop/api-key/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { API_KEY_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function deleteApiKeyController({
	apiKeyId,
	organizationId,
	logger,
	cookie,
	requestDetails,
}: {
	apiKeyId: string;
	organizationId: string;
	logger: Logger;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
	};
}): Promise<{ id: string; message: string; object: "api_key"; event: string }> {
	logger.info({ apiKeyId }, "Checking if api key exists");
	try {
		const existing = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, apiKeyId),
				eq(schema.apikey.organizationId, organizationId),
			),
		});

		if (!existing) {
			logger.warn({ apiKeyId }, "API key not found");
			throw status(404, { message: "API key not found" });
		}

		logger.info({ apiKeyId }, "Deleting API key");
		await db
			.delete(schema.apikey)
			.where(
				and(
					eq(schema.apikey.id, apiKeyId),
					eq(schema.apikey.organizationId, organizationId),
				),
			);

		logger.info({ apiKeyId }, "API key deleted successfully");
		const result = {
			id: apiKeyId,
			message: "API key deleted successfully",
			object: "api_key" as const,
			event: API_KEY_DELETE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: API_KEY_DELETE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails,
		});

		return result;
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
