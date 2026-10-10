import { createHash } from "node:crypto";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import type { AuthContext } from "@reloop/auth/middleware/types";
import { isUserBanned } from "@reloop/auth/user/is-banned";
import { db as defaultDb } from "@reloop/db/client";
import { member, user } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";

export type OAuthVerify = (
	token: string,
	issuer: string,
	audience: string,
	jwksUrl: string,
) => Promise<JWTPayload>;

export type OAuthTokenCacheEntry = {
	userId: string;
	organizationId: string | null;
	expiresAtMs: number;
};

const OAUTH_TOKEN_MAX_LENGTH = 8192;
const OAUTH_CACHE_TTL_SECONDS = 300;
const OAUTH_CACHE_PREFIX = "oauth:token:";

const jwksByUrl = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function jwksFor(jwksUrl: string): ReturnType<typeof createRemoteJWKSet> {
	let jwks = jwksByUrl.get(jwksUrl);
	if (!jwks) {
		jwks = createRemoteJWKSet(new URL(jwksUrl));
		jwksByUrl.set(jwksUrl, jwks);
	}
	return jwks;
}

export const defaultOAuthVerify: OAuthVerify = async (
	token,
	issuer,
	audience,
	jwksUrl,
) => {
	const { payload } = await jwtVerify(token, jwksFor(jwksUrl), {
		issuer,
		audience,
	});
	return payload;
};

export function extractOAuthToken(headers: Headers): string | null {
	const authorization = headers.get("authorization");
	if (!authorization) return null;
	const token = authorization.replace(/^Bearer\s+/i, "").trim();
	if (!token || token.length > OAUTH_TOKEN_MAX_LENGTH) return null;
	if (!isJwtShape(token)) return null;
	return token;
}

function isJwtShape(value: string): boolean {
	const parts = value.split(".");
	if (parts.length !== 3) return false;
	return parts.every(
		(part) => part.length > 0 && /^[A-Za-z0-9_-]+$/.test(part),
	);
}

function oauthCacheKey(token: string): string {
	return `${OAUTH_CACHE_PREFIX}${createHash("sha256").update(token).digest("hex")}`;
}

function originOf(baseUrl: string): string {
	return baseUrl.replace(/\/$/, "");
}

export function oauthIssuer(baseUrl: string): string {
	return `${originOf(baseUrl)}/api/auth/v1`;
}

export function oauthResource(baseUrl: string, override?: string): string {
	if (override?.trim()) return override.trim();
	return `${originOf(baseUrl)}/mcp`;
}

type OAuthDb = typeof defaultDb;

async function findUser(
	db: OAuthDb,
	userId: string,
): Promise<{
	id: string;
	role: string;
	banned: boolean | null;
	banExpires: Date | null;
	activeOrganizationId: string | null;
} | null> {
	const row = await db.query.user.findFirst({
		where: eq(user.id, userId),
		columns: {
			id: true,
			role: true,
			banned: true,
			banExpires: true,
			activeOrganizationId: true,
		},
	});
	if (!row) return null;
	return {
		id: row.id,
		role: row.role,
		banned: row.banned,
		banExpires: row.banExpires,
		activeOrganizationId: row.activeOrganizationId,
	};
}

async function isMember(
	db: OAuthDb,
	userId: string,
	organizationId: string,
): Promise<boolean> {
	const row = await db.query.member.findFirst({
		where: and(
			eq(member.userId, userId),
			eq(member.organizationId, organizationId),
		),
		columns: { id: true },
	});
	return Boolean(row);
}

export async function resolveOAuthAuth(
	headers: Headers,
	deps: ResolverDeps,
	opts: { requireOrg: boolean; db?: OAuthDb; verify?: OAuthVerify } = {
		requireOrg: true,
	},
): Promise<AuthContext | null> {
	const token = extractOAuthToken(headers);
	if (!token) return null;

	const db = opts.db ?? defaultDb;
	const verify = opts.verify ?? defaultOAuthVerify;
	const issuer = oauthIssuer(deps.baseUrl);
	const audience = oauthResource(deps.baseUrl, deps.oauthResource);
	const cacheKey = oauthCacheKey(token);

	const cached = await deps.redis
		.get<OAuthTokenCacheEntry>(cacheKey)
		.catch(() => undefined);
	if (cached) {
		if (cached.expiresAtMs <= Date.now()) {
			await deps.redis.delete(cacheKey).catch(() => undefined);
			return null;
		}
		const account = await findUser(db, cached.userId).catch(() => null);
		if (!account || isUserBanned(account)) {
			await deps.redis.delete(cacheKey).catch(() => undefined);
			return null;
		}
		if (cached.organizationId) {
			const ok = await isMember(db, account.id, cached.organizationId).catch(
				() => false,
			);
			if (!ok) {
				await deps.redis.delete(cacheKey).catch(() => undefined);
				return null;
			}
		} else if (opts.requireOrg) {
			return null;
		}
		return {
			userId: account.id,
			organizationId: cached.organizationId,
			platformRole: account.role,
			authType: "oauth",
		};
	}

	let payload: JWTPayload;
	try {
		payload = await verify(token, issuer, audience, `${issuer}/jwks`);
	} catch {
		return null;
	}
	if (typeof payload.sub !== "string" || !payload.sub) return null;

	const account = await findUser(db, payload.sub).catch(() => null);
	if (!account || isUserBanned(account)) return null;

	const requested = headers.get("x-organization-id")?.trim() || null;
	const organizationId = requested ?? account.activeOrganizationId;
	if (organizationId) {
		const ok = await isMember(db, account.id, organizationId).catch(
			() => false,
		);
		if (!ok) return null;
	} else if (opts.requireOrg) {
		return null;
	}

	const expiresAtMs =
		typeof payload.exp === "number" ? payload.exp * 1000 : Date.now() + 60000;
	const ttlSeconds = Math.max(
		1,
		Math.min(
			OAUTH_CACHE_TTL_SECONDS,
			Math.floor((expiresAtMs - Date.now()) / 1000),
		),
	);
	await deps.redis
		.set(
			cacheKey,
			{ userId: account.id, organizationId, expiresAtMs },
			ttlSeconds,
		)
		.catch(() => undefined);

	return {
		userId: account.id,
		organizationId,
		platformRole: account.role,
		authType: "oauth",
	};
}
