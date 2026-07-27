import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import { toApiKeyResponse } from "@reloop/api-key/mappers/api-key-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { controllerLog } from "@reloop/api-key/utils/controller-log";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";

export async function getApiKeyController({
	apiKeyId,
	organizationId,
}: {
	apiKeyId: string;
	organizationId: string;
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	const log = controllerLog();
	log.info("Getting API key");

	const result = await db.query.apikey.findFirst({
		where: and(
			eq(schema.apikey.id, apiKeyId),
			eq(schema.apikey.organizationId, organizationId),
		),
		with: { user: true },
	});

	if (!result) {
		log.warn("API key not found");
		throw ApiKeyErrors.notFound(apiKeyId);
	}

	log.info("API key retrieved successfully");
	return toApiKeyResponse(result, API_KEY_GET_WEBHOOK_EVENT.id);
}
