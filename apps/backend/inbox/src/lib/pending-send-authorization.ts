/**
 * pending-send-authorization.ts — may a queued send still go out?
 *
 * Scheduled sends and undo-window sends are checked against the API key's
 * scope when they are queued, but the cron flushes them later with the
 * internal secret. If the key was disabled, deleted, expired or restricted
 * in the meantime, the email must not be sent. Sends queued from a dashboard
 * session (no apiKeyId) are not affected.
 */

import {
	type ApiKeyScope,
	loadApiKeyScope,
	scopeAllowsAddress,
} from "@reloop/db/api-key-scope";
import { db } from "@reloop/db/client";
import { apikey, mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";

export type PendingKeyState = {
	enabled: boolean;
	deletedAt: Date | null;
	expiresAt: Date | null;
	organizationId: string | null;
} | null;

/** Pure: why the queued send must be blocked, or null if it may be sent. */
export function pendingSendBlockReason(input: {
	organizationId: string;
	fromAddress: string | null;
	key: PendingKeyState;
	keyScope: ApiKeyScope;
	now: Date;
}): string | null {
	const { key } = input;
	if (!key || key.deletedAt !== null) {
		return "The API key that queued this email was deleted before it was sent.";
	}
	if (key.organizationId !== input.organizationId) {
		return "The API key that queued this email no longer belongs to this organization.";
	}
	if (!key.enabled) {
		return "The API key that queued this email was disabled before it was sent.";
	}
	if (
		key.expiresAt !== null &&
		key.expiresAt.getTime() <= input.now.getTime()
	) {
		return "The API key that queued this email expired before it was sent.";
	}
	if (!input.fromAddress) {
		return "The sending mailbox no longer exists.";
	}
	if (!scopeAllowsAddress(input.keyScope, input.fromAddress)) {
		return `The API key that queued this email is no longer allowed to send from ${input.fromAddress}.`;
	}
	return null;
}

/** Load the key, mailbox and scope, then decide. Session sends always pass. */
export async function checkPendingSendAuthorization(row: {
	organizationId: string;
	mailboxId: string;
	apiKeyId?: string;
}): Promise<string | null> {
	if (!row.apiKeyId) return null;

	const [key] = await db
		.select({
			enabled: apikey.enabled,
			deletedAt: apikey.deletedAt,
			expiresAt: apikey.expiresAt,
			organizationId: apikey.organizationId,
		})
		.from(apikey)
		.where(eq(apikey.id, row.apiKeyId))
		.limit(1);

	const [mbx] = await db
		.select({ email: mailbox.email })
		.from(mailbox)
		.where(
			and(
				eq(mailbox.id, row.mailboxId),
				eq(mailbox.organizationId, row.organizationId),
			),
		)
		.limit(1);

	const keyScope = key
		? await loadApiKeyScope(row.apiKeyId)
		: { restricted: true, entries: [] };

	return pendingSendBlockReason({
		organizationId: row.organizationId,
		fromAddress: mbx?.email ?? null,
		key: key ?? null,
		keyScope,
		now: new Date(),
	});
}
