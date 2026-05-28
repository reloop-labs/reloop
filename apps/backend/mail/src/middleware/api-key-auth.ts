import { validateApiKey as validateApiKeyShared } from "@reloop/apikey";
import { redis } from "@reloop/be-mail/utils/loader";

export async function validateApiKey(apiKey: string | null | undefined) {
	return validateApiKeyShared(apiKey, redis);
}
