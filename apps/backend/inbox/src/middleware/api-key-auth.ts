import { validateApiKey as validateApiKeyShared } from "@reloop/apikey";
import { redis } from "@reloop/be-inbox/utils/loader";

export async function validateApiKey(apiKey: string | null | undefined) {
	return validateApiKeyShared(apiKey, redis);
}
