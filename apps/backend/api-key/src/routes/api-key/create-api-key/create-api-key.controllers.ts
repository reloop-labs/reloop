import { toApiKeyWithKeyResponse } from "@reloop/api-key/mappers/api-key-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { controllerLog } from "@reloop/api-key/utils/controller-log";
import { apiKeyCredential } from "@reloop/api-key/utils/loader";
import { API_KEY_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";

export async function createApiKeyController({
	organizationId,
	userId,
	name,
}: {
	organizationId: string;
	userId: string;
	name: string;
}): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
	const { row, plaintextKey } = await apiKeyCredential.create({
		organizationId,
		userId,
		name,
		log: controllerLog(),
	});

	return toApiKeyWithKeyResponse(
		row,
		plaintextKey,
		API_KEY_CREATE_WEBHOOK_EVENT.id,
	);
}
