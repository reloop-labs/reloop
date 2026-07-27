import { createId } from "@paralleldrive/cuid2";
import { API_KEY_CREATE_DEFAULTS } from "@reloop/api-key/credential/defaults";
import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import {
	API_KEY_PREFIX,
	generateApiKey,
	getKeyStart,
	hashApiKey,
} from "@reloop/auth/apikey";
import type { ApiKeyCredentialCache } from "@reloop/auth/apikey/credential-cache";
import {
	BusEvent,
	type BusEvent as BusEventName,
	type EventPayloads,
} from "@reloop/bus";
import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";

export type ApiKeyCredentialBus = {
	publish<T extends BusEventName>(
		event: T,
		payload: EventPayloads[T],
		opts?: { msgId?: string },
	): Promise<void>;
};

export type ApiKeyCredentialLog = {
	info: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string, data?: unknown) => void;
};

export type ApiKeyCredentialDeps = {
	db: DatabaseInstance;
	credentialCache: ApiKeyCredentialCache;
	bus: ApiKeyCredentialBus;
};

export type ApiKeyCreator = {
	id: string;
	name: string | null;
	image: string | null;
	email: string;
};

/** API Key row after disable; creator may be missing if the user relation is gone. */
export type ApiKeyRowWithUser = typeof schema.apikey.$inferSelect & {
	user?: ApiKeyCreator | null;
};

export type DisableApiKeyResult = {
	row: ApiKeyRowWithUser;
	/** True when the row was already disabled before this call. */
	alreadyDisabled: boolean;
};

export type DeleteApiKeyResult = {
	id: string;
};

/** Rotated row plus the new plaintext secret (returned once; never stored). */
export type RotateApiKeyResult = {
	row: typeof schema.apikey.$inferSelect;
	/** New secret material — show once; never log or persist. */
	plaintextKey: string;
};

export type CreateApiKeyResult = {
	row: typeof schema.apikey.$inferSelect;
	/** Secret material — show once; never log or persist. */
	plaintextKey: string;
};

export type EnableApiKeyResult = {
	row: ApiKeyRowWithUser;
	/** True when the row was already enabled before this call. */
	alreadyEnabled: boolean;
};

export type UpdateApiKeyResult = {
	row: ApiKeyRowWithUser;
};

function defaultLog(): ApiKeyCredentialLog {
	return {
		info: () => {},
		warn: () => {},
		error: () => {},
	};
}

function credentialCacheRevokeError(
	action: "disabled" | "deleted" | "rotated",
) {
	const retryOp =
		action === "deleted"
			? "delete"
			: action === "rotated"
				? "rotate"
				: "disable";
	return createError({
		status: 503,
		message: "Failed to revoke API key credential cache",
		why: `The API key was ${action} in the database but its auth cache entry could not be cleared.`,
		fix: `Retry the ${retryOp} operation. If the problem persists, contact support.`,
	});
}

/**
 * Service-local mutators for API Key credential material.
 * Auth owns the credential cache; this module owns DB lifecycle + invalidate + bus.
 */
export function createApiKeyCredential(deps: ApiKeyCredentialDeps) {
	const { db, credentialCache, bus } = deps;

	async function loadRowWithUser(
		id: string,
		organizationId: string,
		committedRow: typeof schema.apikey.$inferSelect,
		log: ApiKeyCredentialLog,
		missingMessage: string,
	): Promise<ApiKeyRowWithUser> {
		const withUser = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, id),
				eq(schema.apikey.organizationId, organizationId),
			),
			with: { user: true },
		});

		if (withUser) {
			return {
				...withUser,
				user: withUser.user ?? null,
			};
		}

		log.warn(missingMessage);
		return { ...committedRow, user: null };
	}

	return {
		async create({
			organizationId,
			userId,
			name,
			log = defaultLog(),
		}: {
			organizationId: string;
			userId: string;
			name: string;
			log?: ApiKeyCredentialLog;
		}): Promise<CreateApiKeyResult> {
			log.info("Generating new API key");
			const plaintextKey = generateApiKey();
			const hashedKey = hashApiKey(plaintextKey);
			const keyStart = getKeyStart(plaintextKey);
			const keyId = `api_key_${createId()}`;
			const now = new Date();
			const remaining = API_KEY_CREATE_DEFAULTS.rateLimitMax;

			log.info("Inserting API key in database");
			const [inserted] = await db
				.insert(schema.apikey)
				.values({
					id: keyId,
					name,
					start: keyStart,
					prefix: API_KEY_PREFIX,
					key: hashedKey,
					organizationId,
					userId,
					refillInterval: API_KEY_CREATE_DEFAULTS.refillInterval,
					refillAmount: API_KEY_CREATE_DEFAULTS.refillAmount,
					lastRefillAt: API_KEY_CREATE_DEFAULTS.lastRefillAt,
					enabled: API_KEY_CREATE_DEFAULTS.enabled,
					rateLimitEnabled: API_KEY_CREATE_DEFAULTS.rateLimitEnabled,
					rateLimitTimeWindow: API_KEY_CREATE_DEFAULTS.rateLimitTimeWindow,
					rateLimitMax: API_KEY_CREATE_DEFAULTS.rateLimitMax,
					requestCount: API_KEY_CREATE_DEFAULTS.requestCount,
					remaining,
					lastRequest: API_KEY_CREATE_DEFAULTS.lastRequest,
					expiresAt: API_KEY_CREATE_DEFAULTS.expiresAt,
					createdAt: now,
					updatedAt: now,
					permissions: API_KEY_CREATE_DEFAULTS.permissions,
					metadata: API_KEY_CREATE_DEFAULTS.metadata,
				})
				.returning();

			if (!inserted) {
				log.error("Failed to create API key");
				throw ApiKeyErrors.createFailed();
			}
			log.info("New API key generated");

			// Bus is best-effort: create already committed; auth does not depend on NATS.
			try {
				await bus.publish(BusEvent.API_KEY_CREATED, {
					api_key_id: inserted.id,
					organizationId,
				});
				log.info("NATS event published");
			} catch (err) {
				log.error("NATS publish failed after create", err);
			}

			return { row: inserted, plaintextKey };
		},

		async enable({
			id,
			organizationId,
			log = defaultLog(),
		}: {
			id: string;
			organizationId: string;
			log?: ApiKeyCredentialLog;
		}): Promise<EnableApiKeyResult> {
			const { alreadyEnabled, committedRow } = await db.transaction(
				async (tx) => {
					const locked = await tx
						.select()
						.from(schema.apikey)
						.where(
							and(
								eq(schema.apikey.id, id),
								eq(schema.apikey.organizationId, organizationId),
							),
						)
						.for("update");

					const row = locked[0];
					if (!row) {
						log.warn("API key not found");
						throw ApiKeyErrors.notFound(id);
					}

					if (row.enabled) {
						log.info("API key is already enabled");
						return {
							alreadyEnabled: true as const,
							committedRow: row,
						};
					}

					const [updated] = await tx
						.update(schema.apikey)
						.set({ enabled: true, updatedAt: new Date() })
						.where(
							and(
								eq(schema.apikey.id, id),
								eq(schema.apikey.organizationId, organizationId),
							),
						)
						.returning();

					if (!updated) {
						log.error("Failed to enable API key");
						throw ApiKeyErrors.enableFailed(id);
					}

					log.info("API key enabled successfully");
					return {
						alreadyEnabled: false as const,
						committedRow: updated,
					};
				},
			);

			if (!alreadyEnabled) {
				try {
					await bus.publish(BusEvent.API_KEY_ENABLED, {
						api_key_id: id,
						organizationId,
					});
					log.info("NATS event published");
				} catch (err) {
					log.error("NATS publish failed after enable", err);
				}
			}

			const row = await loadRowWithUser(
				id,
				organizationId,
				committedRow,
				log,
				"API key row missing after successful enable; returning committed row without creator",
			);
			return { row, alreadyEnabled };
		},

		async update({
			id,
			organizationId,
			name,
			log = defaultLog(),
		}: {
			id: string;
			organizationId: string;
			name: string;
			log?: ApiKeyCredentialLog;
		}): Promise<UpdateApiKeyResult> {
			log.info("Updating API key");
			const [updated] = await db
				.update(schema.apikey)
				.set({ name, updatedAt: new Date() })
				.where(
					and(
						eq(schema.apikey.id, id),
						eq(schema.apikey.organizationId, organizationId),
					),
				)
				.returning();

			if (!updated) {
				log.warn("API key not found");
				throw ApiKeyErrors.notFound(id);
			}

			log.info("API key updated successfully");

			try {
				await bus.publish(BusEvent.API_KEY_UPDATED, {
					api_key_id: id,
					organizationId,
				});
				log.info("NATS event published");
			} catch (err) {
				log.error("NATS publish failed after update", err);
			}

			const row = await loadRowWithUser(
				id,
				organizationId,
				updated,
				log,
				"API key row missing after successful update; returning committed row without creator",
			);
			return { row };
		},

		async disable({
			id,
			organizationId,
			log = defaultLog(),
		}: {
			id: string;
			organizationId: string;
			log?: ApiKeyCredentialLog;
		}): Promise<DisableApiKeyResult> {
			const { hashedKey, alreadyDisabled, committedRow } = await db.transaction(
				async (tx) => {
					const locked = await tx
						.select()
						.from(schema.apikey)
						.where(
							and(
								eq(schema.apikey.id, id),
								eq(schema.apikey.organizationId, organizationId),
							),
						)
						.for("update");

					const row = locked[0];
					if (!row) {
						log.warn("API key not found");
						throw ApiKeyErrors.notFound(id);
					}

					if (!row.enabled) {
						log.info("API key is already disabled");
						return {
							hashedKey: row.key,
							alreadyDisabled: true as const,
							committedRow: row,
						};
					}

					const [updated] = await tx
						.update(schema.apikey)
						.set({ enabled: false, updatedAt: new Date() })
						.where(
							and(
								eq(schema.apikey.id, id),
								eq(schema.apikey.organizationId, organizationId),
							),
						)
						.returning();

					if (!updated) {
						log.error("Failed to disable API key");
						throw ApiKeyErrors.disableFailed(id);
					}

					log.info("API key disabled successfully");
					return {
						hashedKey: updated.key,
						alreadyDisabled: false as const,
						committedRow: updated,
					};
				},
			);

			// Post-commit: fail closed if cache cannot be cleared
			try {
				await credentialCache.invalidate(hashedKey);
			} catch (cause) {
				log.error("Failed to invalidate API key credential cache", cause);
				throw credentialCacheRevokeError("disabled");
			}

			if (!alreadyDisabled) {
				try {
					await bus.publish(BusEvent.API_KEY_DISABLED, {
						api_key_id: id,
						organizationId,
					});
					log.info("NATS event published");
				} catch (err) {
					log.error(
						"NATS publish failed after disable (auth already revoked)",
						err,
					);
				}
			}

			// Prefer full row + creator for the response; never 404 after a committed disable.
			const row = await loadRowWithUser(
				id,
				organizationId,
				committedRow,
				log,
				"API key row missing after successful disable; returning committed row without creator",
			);
			return { row, alreadyDisabled };
		},

		async delete({
			id,
			organizationId,
			log = defaultLog(),
		}: {
			id: string;
			organizationId: string;
			log?: ApiKeyCredentialLog;
		}): Promise<DeleteApiKeyResult> {
			const txnResult = await db.transaction(async (tx) => {
				const locked = await tx
					.select()
					.from(schema.apikey)
					.where(
						and(
							eq(schema.apikey.id, id),
							eq(schema.apikey.organizationId, organizationId),
						),
					)
					.for("update");

				const row = locked[0];
				if (!row) {
					return { kind: "missing" as const };
				}

				const hashedKey = row.key;

				const [deleted] = await tx
					.delete(schema.apikey)
					.where(
						and(
							eq(schema.apikey.id, id),
							eq(schema.apikey.organizationId, organizationId),
						),
					)
					.returning({ id: schema.apikey.id });

				if (!deleted) {
					log.error("Failed to delete API key");
					throw ApiKeyErrors.deleteFailed(id);
				}

				log.info("API key deleted successfully");
				return { kind: "deleted" as const, hashedKey };
			});

			// Row already gone (retry after prior commit): still clear cache via id index.
			if (txnResult.kind === "missing") {
				log.warn("API key not found; clearing any residual credential cache");
				try {
					await credentialCache.invalidateByApiKeyId(id);
				} catch (cause) {
					log.error("Failed to invalidate API key credential cache", cause);
					throw credentialCacheRevokeError("deleted");
				}
				// Idempotent delete: key is gone and cache was cleared (or never present).
				return { id };
			}

			try {
				await credentialCache.invalidate(txnResult.hashedKey);
			} catch (cause) {
				log.error("Failed to invalidate API key credential cache", cause);
				throw credentialCacheRevokeError("deleted");
			}

			// Bus is best-effort (see #64): auth correctness does not depend on NATS.
			try {
				await bus.publish(BusEvent.API_KEY_DELETED, {
					api_key_id: id,
					organizationId,
				});
				log.info("NATS event published");
			} catch (err) {
				log.error(
					"NATS publish failed after delete (auth already revoked)",
					err,
				);
			}

			return { id };
		},

		/**
		 * Replace secret material for an existing API key.
		 * Old secret must become invalid immediately: DB hash is updated under
		 * row lock, then the verify cache is cleared fail-closed for the old hash
		 * (and via reverse id index so a retry after a partial failure can still
		 * clear a stale cache entry that still points at a prior secret).
		 */
		async rotate({
			id,
			organizationId,
			log = defaultLog(),
		}: {
			id: string;
			organizationId: string;
			log?: ApiKeyCredentialLog;
		}): Promise<RotateApiKeyResult> {
			log.info("Generating new API key material for rotate");
			const plaintextKey = generateApiKey();
			const newHashedKey = hashApiKey(plaintextKey);
			const keyStart = getKeyStart(plaintextKey);
			const now = new Date();

			const { oldHashedKey, committedRow } = await db.transaction(
				async (tx) => {
					const locked = await tx
						.select()
						.from(schema.apikey)
						.where(
							and(
								eq(schema.apikey.id, id),
								eq(schema.apikey.organizationId, organizationId),
							),
						)
						.for("update");

					const row = locked[0];
					if (!row) {
						log.warn("API key not found");
						throw ApiKeyErrors.notFound(id);
					}

					const oldHashedKey = row.key;

					const [updated] = await tx
						.update(schema.apikey)
						.set({
							key: newHashedKey,
							start: keyStart,
							updatedAt: now,
						})
						.where(
							and(
								eq(schema.apikey.id, id),
								eq(schema.apikey.organizationId, organizationId),
							),
						)
						.returning();

					if (!updated) {
						log.error("Failed to rotate API key");
						throw ApiKeyErrors.rotateFailed(id);
					}

					log.info("API key rotated successfully");
					return { oldHashedKey, committedRow: updated };
				},
			);

			// Post-commit: fail closed if the old secret cannot be evicted from verify cache.
			// invalidate(oldHash) clears primary + reverse when the entry is still present.
			// invalidateByApiKeyId covers retry after a prior rotate that updated DB but
			// failed cache clear (reverse index may still map id → a previous secret hash).
			try {
				await credentialCache.invalidate(oldHashedKey);
				await credentialCache.invalidateByApiKeyId(id);
			} catch (cause) {
				log.error("Failed to invalidate API key credential cache", cause);
				throw credentialCacheRevokeError("rotated");
			}

			// Bus is best-effort: auth correctness does not depend on NATS.
			try {
				await bus.publish(BusEvent.API_KEY_ROTATED, {
					api_key_id: id,
					organizationId,
				});
				log.info("NATS event published");
			} catch (err) {
				log.error(
					"NATS publish failed after rotate (old secret already revoked)",
					err,
				);
			}

			return { row: committedRow, plaintextKey };
		},
	};
}

export type ApiKeyCredential = ReturnType<typeof createApiKeyCredential>;
