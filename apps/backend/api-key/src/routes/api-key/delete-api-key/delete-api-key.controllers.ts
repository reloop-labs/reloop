import { apiKeyCredential } from "@reloop/api-key/utils/loader";
import { API_KEY_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { useLogger } from "evlog/elysia";

export async function deleteApiKeyController({
	apiKeyId,
	organizationId,
}: {
	apiKeyId: string;
	organizationId: string;
}): Promise<{ id: string; message: string; object: "api_key"; event: string }> {
	const elysiaLog = useLogger();
	const log = {
		info: (message: string) => {
			elysiaLog.info(message);
		},
		warn: (message: string) => {
			elysiaLog.warn(message);
		},
		error: (message: string, data?: unknown) => {
			if (data !== undefined) {
				elysiaLog.error({
					message,
					error: data instanceof Error ? data.message : String(data),
					cause:
						data instanceof Error && data.cause != null
							? String(data.cause)
							: undefined,
				});
			} else {
				elysiaLog.error(message);
			}
		},
	};

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
