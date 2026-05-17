import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import { createLog } from "@reloop/api-key/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { log } from "evlog";

export async function deleteApiKeyController({
	apiKeyId,
	organizationId,
	cookie,
}: {
	apiKeyId: string;
	organizationId: string;
	cookie?: string;
}): Promise<{ id: string; message: string; object: "api_key"; event: string }> {
	log.info({ ...{ apiKeyId }, message: "Checking if api key exists" });
	try {
		const existing = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, apiKeyId),
				eq(schema.apikey.organizationId, organizationId),
			),
		});

		if (!existing) {
			log.warn({ ...{ apiKeyId }, message: "API key not found" });
			throw ApiKeyErrors.notFound(apiKeyId);
		}

		log.info({ ...{ apiKeyId }, message: "Deleting API key" });
		await db
			.delete(schema.apikey)
			.where(
				and(
					eq(schema.apikey.id, apiKeyId),
					eq(schema.apikey.organizationId, organizationId),
				),
			);

		log.info({ ...{ apiKeyId }, message: "API key deleted successfully" });
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
		});

		return result;
	} catch (error) {
		log.error({
			apiKeyId,
			error: error instanceof Error ? error.message : String(error),
			message: "Error deleting API key",
		});
		throw error;
	}
}
