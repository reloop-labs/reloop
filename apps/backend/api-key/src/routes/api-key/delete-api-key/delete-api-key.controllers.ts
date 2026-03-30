import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function deleteApiKeyController({
	apiKeyId,
	organizationId,
	logger,
}: {
	apiKeyId: string;
	organizationId: string;
	logger: Logger;
}): Promise<{ id: string; message: string }> {
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
		return { id: apiKeyId, message: "API key deleted successfully" };
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
