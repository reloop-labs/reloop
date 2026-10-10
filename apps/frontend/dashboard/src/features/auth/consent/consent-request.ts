/**
 * OAuth authorization-request helpers for the `/consent` page.
 *
 * The authorize endpoint redirects logged-in users here as
 * `/dashboard/consent?{signed query}` where the query carries the original
 * `client_id`, `scope`, `redirect_uri`, `resource`, `state`, …, plus the
 * server signature (`sig`/`exp`). The page must round-trip that exact query
 * string as `oauth_query` when it POSTs the decision — the server verifies
 * the signature and continues the flow from request state.
 */

export interface OAuthAuthorizationRequest {
	clientId: string;
	scopes: string[];
	redirectUri: string;
	resources: string[];
	state: string | null;
	/** Exact query string to echo back as `oauth_query`. */
	rawQuery: string;
}

export function parseOAuthAuthorizationRequest(
	search: string,
): OAuthAuthorizationRequest | null {
	const normalized = search.startsWith("?") ? search.slice(1) : search;
	if (!normalized) return null;
	const params = new URLSearchParams(normalized);
	const clientId = params.get("client_id");
	const redirectUri = params.get("redirect_uri");
	if (!clientId || !redirectUri) return null;
	return {
		clientId,
		scopes: (params.get("scope") ?? "").split(" ").filter(Boolean),
		redirectUri,
		resources: params.getAll("resource").filter(Boolean),
		state: params.get("state"),
		rawQuery: normalized,
	};
}

const SCOPE_DESCRIPTIONS: Record<string, string> = {
	openid: "Verify your identity",
	profile: "See your name and profile picture",
	email: "See your email address",
	offline_access: "Stay connected when you're away",
};

export function describeScope(scope: string): string {
	const known = SCOPE_DESCRIPTIONS[scope];
	if (known) return known;
	return scope.replace(/[_:-]+/g, " ").trim() || scope;
}

export interface ConsentCapability {
	id: string;
	icon: string;
	title: string;
	description: string;
}

function isMcpResource(resource: string): boolean {
	try {
		return new URL(resource).pathname.replace(/\/+$/, "").endsWith("/mcp");
	} catch {
		return false;
	}
}

/**
 * Plain-language list of what approving grants. Identity scopes collapse into
 * one line; an MCP resource adds the Reloop tools the token unlocks in the
 * chosen workspace (mirrors the reloop-mcp tool set).
 */
export function describeCapabilities(input: {
	scopes: string[];
	resources: string[];
}): ConsentCapability[] {
	const capabilities: ConsentCapability[] = [];
	if (input.resources.some(isMcpResource)) {
		capabilities.push(
			{
				id: "contacts",
				icon: "contacts",
				title: "View and manage contacts",
				description: "List, create, update and delete contacts.",
			},
			{
				id: "email",
				icon: "mail-send",
				title: "Send email",
				description: "Send email from this workspace's verified domains.",
			},
		);
	}
	const identity = ["openid", "profile", "email"].filter((scope) =>
		input.scopes.includes(scope),
	);
	if (identity.length > 0) {
		const parts = [
			input.scopes.includes("profile") ? "name" : null,
			input.scopes.includes("email") ? "email address" : null,
		].filter(Boolean);
		capabilities.push({
			id: "identity",
			icon: "user-circle",
			title: "Know who you are",
			description:
				parts.length > 0
					? `See your ${parts.join(" and ")}.`
					: "Confirm your Reloop account.",
		});
	}
	if (input.scopes.includes("offline_access")) {
		capabilities.push({
			id: "offline",
			icon: "refresh",
			title: "Stay connected",
			description: "Keep access until you revoke it.",
		});
	}
	const known = new Set(["openid", "profile", "email", "offline_access"]);
	for (const scope of input.scopes) {
		if (known.has(scope)) continue;
		capabilities.push({
			id: `scope:${scope}`,
			icon: "key",
			title: describeScope(scope),
			description: scope,
		});
	}
	return capabilities;
}

/** One-line summary for the access row, e.g. "View and manage contacts, send email". */
export function summarizeAccess(capabilities: ConsentCapability[]): string {
	const summary = capabilities
		.filter((capability) => capability.id !== "offline")
		.map((capability) => capability.title.toLowerCase())
		.join(", ");
	return summary
		? summary.charAt(0).toUpperCase() + summary.slice(1)
		: "Confirm your account";
}

export function redirectHost(redirectUri: string): string {
	try {
		return new URL(redirectUri).host;
	} catch {
		return redirectUri;
	}
}

export interface OAuthPublicClient {
	client_id: string;
	client_name?: string;
	client_uri?: string;
	logo_uri?: string;
	policy_uri?: string;
	tos_uri?: string;
}

async function readErrorMessage(
	res: Response,
	fallback: string,
): Promise<string> {
	try {
		const data = (await res.json()) as {
			error_description?: unknown;
			message?: unknown;
		};
		if (typeof data.error_description === "string" && data.error_description)
			return data.error_description;
		if (typeof data.message === "string" && data.message) return data.message;
	} catch {
		// Fall through to the status-based fallback below.
	}
	return `${fallback} (status ${res.status})`;
}

export async function fetchOAuthPublicClient(
	clientId: string,
): Promise<OAuthPublicClient> {
	const res = await fetch(
		`/api/auth/v1/oauth2/public-client?client_id=${encodeURIComponent(clientId)}`,
		{ credentials: "include", headers: { accept: "application/json" } },
	);
	if (!res.ok) throw new Error(await readErrorMessage(res, "Unknown client"));
	return (await res.json()) as OAuthPublicClient;
}

export async function submitOAuthConsent(input: {
	oauthQuery: string;
	accept: boolean;
	/** Space-separated scopes to grant. Omitted = grant everything requested. */
	scope?: string;
}): Promise<string> {
	const res = await fetch("/api/auth/v1/oauth2/consent", {
		method: "POST",
		credentials: "include",
		headers: {
			"content-type": "application/json",
			accept: "application/json",
		},
		body: JSON.stringify({
			accept: input.accept,
			...(input.scope !== undefined ? { scope: input.scope } : {}),
			oauth_query: input.oauthQuery,
		}),
	});
	if (!res.ok)
		throw new Error(await readErrorMessage(res, "Consent request failed"));
	const data = (await res.json()) as {
		redirect?: boolean;
		url?: string;
		redirect_uri?: string;
	};
	const url = data.url ?? data.redirect_uri;
	if (!url) throw new Error("Consent response missing redirect target");
	return url;
}
