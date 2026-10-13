/**
 * Reads an OAuth access token's claims WITHOUT verifying the signature. The
 * Reloop API verifies every token; this only feeds logs and lets the MCP
 * endpoint answer an expired token with a 401 so clients refresh it, instead
 * of forwarding it and surfacing a tool error inside a 200.
 */
export type OAuthClaims = {
	userId?: string;
	orgId?: string;
	clientId?: string;
	audience: string[];
	expiresAt?: number;
};

function readString(value: unknown): string | undefined {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function readOAuthClaims(token: string): OAuthClaims | undefined {
	const payload = token.split(".")[1];
	if (payload === undefined) {
		return undefined;
	}
	let claims: Record<string, unknown>;
	try {
		const json = Buffer.from(payload, "base64url").toString("utf8");
		const parsed: unknown = JSON.parse(json);
		if (parsed === null || typeof parsed !== "object") {
			return undefined;
		}
		claims = parsed as Record<string, unknown>;
	} catch {
		return undefined;
	}
	const aud = claims.aud;
	return {
		userId: readString(claims.sub),
		orgId: readString(claims.org_id),
		clientId: readString(claims.azp) ?? readString(claims.client_id),
		audience: Array.isArray(aud)
			? aud.filter((entry): entry is string => typeof entry === "string")
			: typeof aud === "string"
				? [aud]
				: [],
		expiresAt: typeof claims.exp === "number" ? claims.exp : undefined,
	};
}

export function isExpired(claims: OAuthClaims, nowMs = Date.now()): boolean {
	return claims.expiresAt !== undefined && claims.expiresAt * 1000 <= nowMs;
}
