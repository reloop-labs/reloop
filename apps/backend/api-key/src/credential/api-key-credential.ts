import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
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

function defaultLog(): ApiKeyCredentialLog {
	return {
		info: () => {},
		warn: () => {},
		error: () => {},
	};
}

/**
 * Service-local mutators for API Key credential material.
 * Auth owns the credential cache; this module owns DB lifecycle + invalidate + bus.
 */
export function createApiKeyCredential(deps: ApiKeyCredentialDeps) {
	const { db, credentialCache, bus } = deps;

	return {
		async disable({
			id,
			organizationId,
			log = defaultLog(),
		}: {
			id: string;
			organizationId: string;
			log?: ApiKeyCredentialLog;
		}): Promise<DisableApiKeyResult> {
			const {
				hashedKey,
				alreadyDisabled,
				committedRow,
			} = await db.transaction(async (tx) => {
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
			});

			// Post-commit: fail closed if cache cannot be cleared
			try {
				await credentialCache.invalidate(hashedKey);
			} catch (cause) {
				log.error("Failed to invalidate API key credential cache", cause);
				throw createError({
					status: 503,
					message: "Failed to revoke API key credential cache",
					why: "The API key was disabled in the database but its auth cache entry could not be cleared.",
					fix: "Retry the disable operation. If the problem persists, contact support.",
				});
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
			const withUser = await db.query.apikey.findFirst({
				where: and(
					eq(schema.apikey.id, id),
					eq(schema.apikey.organizationId, organizationId),
				),
				with: { user: true },
			});

			if (withUser) {
				return {
					row: {
						...withUser,
						user: withUser.user ?? null,
					},
					alreadyDisabled,
				};
			}

			log.warn(
				"API key row missing after successful disable; returning committed row without creator",
			);
			return {
				row: { ...committedRow, user: null },
				alreadyDisabled,
			};
		},
	};
}

export type ApiKeyCredential = ReturnType<typeof createApiKeyCredential>;
