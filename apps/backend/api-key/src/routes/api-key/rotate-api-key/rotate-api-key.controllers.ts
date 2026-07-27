import { toApiKeyWithKeyResponse } from "@reloop/api-key/mappers/api-key-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { controllerLog } from "@reloop/api-key/utils/controller-log";
import { apiKeyCredential } from "@reloop/api-key/utils/loader";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";

export async function rotateApiKeyController({
	id,
	organizationId,
}: {
	id: string;
	organizationId: string;
}): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
	const log = controllerLog();
	log.info("Rotating API key");

	const { row, plaintextKey } = await apiKeyCredential.rotate({
		id,
		organizationId,
		log,
	});

	return toApiKeyWithKeyResponse(
		row,
		plaintextKey,
		API_KEY_UPDATE_WEBHOOK_EVENT.id,
	);
}
