import { toApiKeyResponse } from "@reloop/api-key/mappers/api-key-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { controllerLog } from "@reloop/api-key/utils/controller-log";
import { apiKeyCredential } from "@reloop/api-key/utils/loader";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";

export async function updateApiKeyController({
	apiKeyId,
	organizationId,
	name,
}: {
	apiKeyId: string;
	organizationId: string;
	name: string;
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	const { row } = await apiKeyCredential.update({
		id: apiKeyId,
		organizationId,
		name,
		log: controllerLog(),
	});

	return toApiKeyResponse(row, API_KEY_UPDATE_WEBHOOK_EVENT.id);
}
