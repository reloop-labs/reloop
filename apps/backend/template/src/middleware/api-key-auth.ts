import { redis } from "@be/template/utils/redis";
import { validateApiKey as validateApiKeyShared } from "@reloop/apikey";

export async function validateApiKey(apiKey: string | null | undefined) {
	return validateApiKeyShared(apiKey, redis);
}
