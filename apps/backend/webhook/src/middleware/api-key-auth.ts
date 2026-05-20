import { validateApiKey as validateApiKeyShared } from "@reloop/apikey";
import { redis } from "@reloop/webhook/utils/loader";

export async function validateApiKey(apiKey: string | null | undefined) {
	const result = await validateApiKeyShared(apiKey, redis);
	if (!result) return null;
	return {
		userId: result.userId,
		activeOrganizationId: result.organizationId,
		authType: result.authType,
	};
}
