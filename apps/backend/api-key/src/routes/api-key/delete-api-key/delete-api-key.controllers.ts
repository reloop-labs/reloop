import { controllerLog } from "@reloop/api-key/utils/controller-log";
import { apiKeyCredential } from "@reloop/api-key/utils/loader";
import { API_KEY_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";

export async function deleteApiKeyController({
	apiKeyId,
	organizationId,
}: {
	apiKeyId: string;
	organizationId: string;
}): Promise<{ id: string; message: string; object: "api_key"; event: string }> {
	const log = controllerLog();
	log.info("Deleting API key");

	const { id } = await apiKeyCredential.delete({
		id: apiKeyId,
		organizationId,
		log,
	});

	return {
		id,
		message: "API key deleted successfully",
		object: "api_key" as const,
		event: API_KEY_DELETE_WEBHOOK_EVENT.id,
	};
}
