import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import { toApiKeyResponse } from "@reloop/api-key/mappers/api-key-response";
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
import * as schema from "@reloop/db/schema";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { createError } from "evlog";

export async function updateApiKeyController({
	apiKeyId,
	organizationId,
	name,
	scope,
}: {
	apiKeyId: string;
	organizationId: string;
	name?: string;
	/** Replaces the key's restrictions; [] gives it full access. */
	scope?: ApiKeyScopeInput[];
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	const log = controllerLog();
	if (name === undefined && scope === undefined) {
		throw createError({
			status: 400,
			message: "Nothing to update",
			why: "The request had neither a name nor access restrictions",
			fix: "Send `name`, `scope`, or both",
		});
	}

	const scopeRows =
		scope === undefined
			? undefined
			: await normalizeScopeInput(organizationId, scope);

	if (scopeRows !== undefined) {
		// Readers see the old or the new restrictions, never none in between.
		await db.transaction(async (tx) => {
			const [key] = await tx
				.select({ id: schema.apikey.id })
				.from(schema.apikey)
				.where(
					and(
						eq(schema.apikey.id, apiKeyId),
						eq(schema.apikey.organizationId, organizationId),
						isNull(schema.apikey.deletedAt),
					),
				)
				.for("update");
			if (!key) throw ApiKeyErrors.notFound(apiKeyId);
			await writeScope(tx, { apiKeyId, organizationId, rows: scopeRows });
		});
		log.info("API key restrictions updated");
	}

	let row: Parameters<typeof toApiKeyResponse>[0] | undefined;
	if (name !== undefined) {
		row = (
			await apiKeyCredential.update({ id: apiKeyId, organizationId, name, log })
		).row;
	} else {
		row = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, apiKeyId),
				eq(schema.apikey.organizationId, organizationId),
				isNull(schema.apikey.deletedAt),
			),
			with: { user: true },
		});
		if (!row) throw ApiKeyErrors.notFound(apiKeyId);
	}

	return toApiKeyResponse(
		row,
		API_KEY_UPDATE_WEBHOOK_EVENT.id,
		await loadScopeView(apiKeyId),
	);
}
