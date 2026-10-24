/**
 * api-key-scope.ts — which sender/mailbox addresses may an API key use?
 *
 * A key with no api_key_scope rows has full access (every key created before
 * scoping existed). A key with rows may only use the listed domains (every
 * address on them) or the listed exact addresses. Checked by SMTP AUTH and
 * IMAP login through the domain service's /v1/smtp-auth.
 */

import { eq } from "drizzle-orm";
import { db as defaultDb } from "./client";
import { apiKeyScope, domain } from "./schema";

export type ApiKeyScopeEntry = {
	/** Lowercased domain name. */
	domain: string;
	/** Lowercased exact address, or null for every address on the domain. */
	email: string | null;
	/** Soft-deleted domains stay listed so the key stays restricted, but never match. */
	domainDeleted: boolean;
};

export type ApiKeyScope = {
	/** False means full access; entries is then empty. */
	restricted: boolean;
	entries: ApiKeyScopeEntry[];
};

export function normalizeAddress(address: string): string {
	return address.trim().toLowerCase();
}

/** Pure check, so it can be tested without a database. */
export function scopeAllowsAddress(
	scope: ApiKeyScope,
	address: string,
): boolean {
	if (!scope.restricted) return true;

	const addr = normalizeAddress(address);
	const at = addr.lastIndexOf("@");
	if (at <= 0 || at === addr.length - 1) return false;
	const addrDomain = addr.slice(at + 1);

	return scope.entries.some(
		(entry) =>
			!entry.domainDeleted &&
			entry.domain === addrDomain &&
			(entry.email === null || entry.email === addr),
	);
}

export async function loadApiKeyScope(
	apiKeyId: string,
	database: typeof defaultDb = defaultDb,
): Promise<ApiKeyScope> {
	const rows = await database
		.select({
			domain: domain.domain,
			email: apiKeyScope.email,
			domainDeletedAt: domain.deletedAt,
		})
		.from(apiKeyScope)
		.innerJoin(domain, eq(domain.id, apiKeyScope.domainId))
		.where(eq(apiKeyScope.apiKeyId, apiKeyId));

	return {
		restricted: rows.length > 0,
		entries: rows.map((row) => ({
			domain: normalizeAddress(row.domain),
			email: row.email ? normalizeAddress(row.email) : null,
			domainDeleted: row.domainDeletedAt !== null,
		})),
	};
}

export async function apiKeyAllowsAddress(
	apiKeyId: string,
	address: string,
	database: typeof defaultDb = defaultDb,
): Promise<boolean> {
	return scopeAllowsAddress(await loadApiKeyScope(apiKeyId, database), address);
}
