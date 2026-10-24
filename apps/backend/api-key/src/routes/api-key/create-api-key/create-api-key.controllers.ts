import { toApiKeyWithKeyResponse } from "@reloop/api-key/mappers/api-key-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import {
	type ApiKeyScopeInput,
	loadScopeView,
	normalizeScopeInput,
	writeScope,
} from "@reloop/api-key/utils/api-key-scope";
import { controllerLog } from "@reloop/api-key/utils/controller-log";
import { apiKeyCredential } from "@reloop/api-key/utils/loader";
import { db } from "@reloop/db/client";
import { API_KEY_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";

export async function createApiKeyController({
	organizationId,
	userId,
	name,
	scope = [],
}: {
	organizationId: string;
	userId: string;
	name: string;
	scope?: ApiKeyScopeInput[];
}): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
	const log = controllerLog();
	// Validate restrictions before the key exists, so a bad request never
	// leaves a key behind.
	const scopeRows = await normalizeScopeInput(organizationId, scope);

	const { row, plaintextKey } = await apiKeyCredential.create({
		organizationId,
		userId,
		name,
		log,
	});

	if (scopeRows.length > 0) {
		try {
			await writeScope(db, {
				apiKeyId: row.id,
				organizationId,
				rows: scopeRows,
			});
		} catch (error) {
			// Never hand out a key that silently has full access instead of
			// the restrictions that were asked for.
			log.error("Saving API key restrictions failed; deleting the key", error);
			await apiKeyCredential.delete({ id: row.id, organizationId, log });
			throw error;
		}
	}

	return toApiKeyWithKeyResponse(
		row,
		plaintextKey,
		API_KEY_CREATE_WEBHOOK_EVENT.id,
		await loadScopeView(row.id),
	);
}
