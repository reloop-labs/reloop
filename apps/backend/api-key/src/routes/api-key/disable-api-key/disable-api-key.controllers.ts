import { apiKeyCredential } from "@reloop/api-key/utils/loader";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { useLogger } from "evlog/elysia";

function toApiKeyResponse(
	row: {
		id: string;
		name: string | null;
		start: string | null;
		prefix: string | null;
		refillInterval: number | null;
		refillAmount: number | null;
		lastRefillAt: Date | null;
		enabled: boolean;
		rateLimitEnabled: boolean;
		rateLimitTimeWindow: number;
		rateLimitMax: number;
		requestCount: number;
		remaining: number | null;
		lastRequest: Date | null;
		expiresAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
		permissions: string | null;
		metadata: string | null;
		user?: {
			id: string;
			name: string | null;
			image: string | null;
			email: string;
		} | null;
	},
): ApiKeyTypes.ApiKeyResponse {
	return {
		id: row.id,
		name: row.name,
		start: row.start,
		prefix: row.prefix,
		refillInterval: row.refillInterval,
		refillAmount: row.refillAmount,
		lastRefillAt: row.lastRefillAt?.toISOString() ?? null,
		enabled: row.enabled,
		rateLimitEnabled: row.rateLimitEnabled,
		rateLimitTimeWindow: row.rateLimitTimeWindow,
		rateLimitMax: row.rateLimitMax,
		requestCount: row.requestCount,
		remaining: row.remaining,
		lastRequest: row.lastRequest?.toISOString() ?? null,
		expiresAt: row.expiresAt?.toISOString() ?? null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
		permissions: row.permissions,
		metadata: row.metadata,
		createdBy: row.user
			? {
					id: row.user.id,
					name: row.user.name,
					image: row.user.image,
					email: row.user.email,
				}
			: undefined,
		object: "api_key" as const,
		event: API_KEY_UPDATE_WEBHOOK_EVENT.id,
	};
}

export async function disableApiKeyController({
	id,
	organizationId,
}: {
	id: string;
	organizationId: string;
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	const elysiaLog = useLogger();
	const log = {
		info: (message: string) => {
			elysiaLog.info(message);
		},
		warn: (message: string) => {
			elysiaLog.warn(message);
		},
		error: (message: string, _data?: unknown) => {
			elysiaLog.error(message);
		},
	};

	const { row } = await apiKeyCredential.disable({
		id,
		organizationId,
		log,
	});

	return toApiKeyResponse(row);
}
