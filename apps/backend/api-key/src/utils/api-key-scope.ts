import { loadApiKeyScope, normalizeAddress } from "@reloop/db/api-key-scope";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { createError } from "evlog";

/** One allowed domain, or one exact address on it, as sent by clients. */
export type ApiKeyScopeInput = { domainId: string; email?: string | null };

/** One scope entry as returned to clients. */
export type ApiKeyScopeView = {
	domainId: string;
	domain: string;
	email: string | null;
};

const MAX_SCOPE_ENTRIES = 100;
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+$/;

function invalidScope(why: string) {
	return createError({
		status: 400,
		message: "Invalid API key access restrictions",
		why,
		fix: "Pick domains from your organization, and addresses on those domains",
	});
}

/**
 * Validates and normalizes requested restrictions against the org's domains.
 * A whole-domain entry absorbs any specific addresses on the same domain.
 */
export async function normalizeScopeInput(
	organizationId: string,
	input: ApiKeyScopeInput[],
): Promise<{ domainId: string; email: string | null }[]> {
	if (input.length > MAX_SCOPE_ENTRIES) {
		throw invalidScope(`At most ${MAX_SCOPE_ENTRIES} entries are allowed`);
	}
	if (input.length === 0) return [];

	const domainIds = [...new Set(input.map((entry) => entry.domainId))];
	const domains = await db
		.select({ id: schema.domain.id, domain: schema.domain.domain })
		.from(schema.domain)
		.where(
			and(
				inArray(schema.domain.id, domainIds),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		);
	const domainNames = new Map(
		domains.map((d) => [d.id, normalizeAddress(d.domain)]),
	);

	const wholeDomains = new Set<string>();
	const addresses = new Map<string, Set<string>>();
	for (const entry of input) {
		const domainName = domainNames.get(entry.domainId);
		if (!domainName) {
			throw invalidScope(
				`Domain ${entry.domainId} does not exist in this organization`,
			);
		}
		if (entry.email == null || entry.email.trim() === "") {
			wholeDomains.add(entry.domainId);
			continue;
		}
		const email = normalizeAddress(entry.email);
		if (!EMAIL_PATTERN.test(email)) {
			throw invalidScope(`${entry.email} is not a valid email address`);
		}
		if (email.slice(email.lastIndexOf("@") + 1) !== domainName) {
			throw invalidScope(`${email} is not an address on ${domainName}`);
		}
		const set = addresses.get(entry.domainId) ?? new Set<string>();
		set.add(email);
		addresses.set(entry.domainId, set);
	}

	const rows: { domainId: string; email: string | null }[] = [];
	for (const domainId of wholeDomains) rows.push({ domainId, email: null });
	for (const [domainId, set] of addresses) {
		if (wholeDomains.has(domainId)) continue;
		for (const email of set) rows.push({ domainId, email });
	}
	return rows;
}

type Executor = Pick<typeof db, "insert" | "delete">;

/** Replaces a key's restrictions; an empty list gives the key full access. */
export async function writeScope(
	executor: Executor,
	params: {
		apiKeyId: string;
		organizationId: string;
		rows: { domainId: string; email: string | null }[];
	},
): Promise<void> {
	await executor
		.delete(schema.apiKeyScope)
		.where(eq(schema.apiKeyScope.apiKeyId, params.apiKeyId));
	if (params.rows.length === 0) return;
	await executor.insert(schema.apiKeyScope).values(
		params.rows.map((row) => ({
			apiKeyId: params.apiKeyId,
			organizationId: params.organizationId,
			domainId: row.domainId,
			email: row.email,
		})),
	);
}

/** Restrictions for many keys in one query; keys without rows map to []. */
export async function loadScopeViews(
	apiKeyIds: string[],
): Promise<Map<string, ApiKeyScopeView[]>> {
	const views = new Map<string, ApiKeyScopeView[]>(
		apiKeyIds.map((id) => [id, []]),
	);
	if (apiKeyIds.length === 0) return views;
	const rows = await db
		.select({
			apiKeyId: schema.apiKeyScope.apiKeyId,
			domainId: schema.apiKeyScope.domainId,
			domain: schema.domain.domain,
			email: schema.apiKeyScope.email,
		})
		.from(schema.apiKeyScope)
		.innerJoin(schema.domain, eq(schema.domain.id, schema.apiKeyScope.domainId))
		.where(inArray(schema.apiKeyScope.apiKeyId, apiKeyIds))
		.orderBy(schema.domain.domain, schema.apiKeyScope.email);
	for (const row of rows) {
		views.get(row.apiKeyId)?.push({
			domainId: row.domainId,
			domain: row.domain,
			email: row.email,
		});
	}
	return views;
}

export async function loadScopeView(
	apiKeyId: string,
): Promise<ApiKeyScopeView[]> {
	return (await loadScopeViews([apiKeyId])).get(apiKeyId) ?? [];
}

/**
 * A key with access restrictions must not manage API keys: it could otherwise
 * create an unrestricted key and escape its own restrictions.
 */
export async function assertCanManageApiKeys(ctx: {
	authType: string;
	apiKeyId?: string;
}): Promise<void> {
	if (ctx.authType !== "apikey" || !ctx.apiKeyId) return;
	const scope = await loadApiKeyScope(ctx.apiKeyId);
	if (scope.restricted) {
		throw createError({
			status: 403,
			message: "This API key cannot manage API keys",
			why: "API keys with access restrictions cannot create, view or change API keys",
			fix: "Use an unrestricted API key or the dashboard",
		});
	}
}
