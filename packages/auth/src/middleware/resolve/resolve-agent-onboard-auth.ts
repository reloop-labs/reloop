import { verifyAgentToken } from "@agentonboard/sdk";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import type { AuthContext } from "@reloop/auth/middleware/types";
import { isUserBanned } from "@reloop/auth/user/is-banned";
import { db } from "@reloop/db/client";
import { member, user } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";

export type AgentAuthResolution =
	| { ok: true; ctx: AuthContext }
	| {
			ok: false;
			status: 401 | 403;
			code: string;
			message: string;
			why: string;
			fix: string;
			link?: string;
	  };

export function extractAgentToken(headers: Headers): string | null {
	const fromCustom = headers.get("x-agentonboard-token");
	if (fromCustom?.trim()) return fromCustom.trim();

	const auth = headers.get("authorization");
	if (!auth) return null;
	const token = auth.replace(/^Bearer\s*/i, "").trim();
	if (!token) return null;
	return token;
}

export function resolveAudience(deps: ResolverDeps, headers?: Headers): string {
	if (deps.agentAudience?.trim()) {
		return deps.agentAudience.trim();
	}
	const hostHeader = headers?.get("x-forwarded-host") || headers?.get("host");
	if (hostHeader?.trim()) {
		return hostHeader.trim();
	}
	try {
		const parsed = new URL(deps.baseUrl);
		return parsed.host;
	} catch {
		return "reloop.sh";
	}
}

export async function resolveAgentOnboardAuthDetails(
	headers: Headers,
	deps: ResolverDeps,
	opts: { requireOrg: boolean } = { requireOrg: true },
): Promise<AgentAuthResolution> {
	const token = extractAgentToken(headers);
	if (!token) {
		return {
			ok: false,
			status: 401,
			code: "UNAUTHORIZED",
			message: "Authentication required",
			why: "The request has no AgentOnboard Bearer token.",
			fix: "Mint a session token using AgentOnboard `get_token` tool for this service's audience and pass it as `Authorization: Bearer <token>`.",
			link: "https://reloop.sh/docs/errors",
		};
	}

	const audience = resolveAudience(deps, headers);
	const verification = await verifyAgentToken({
		token,
		audience,
	});

	if (!verification.ok) {
		return {
			ok: false,
			status: 401,
			code: verification.code,
			message: "Invalid or expired AgentOnboard token",
			why: verification.error || "Token verification failed.",
			fix: "Call `get_token` tool again to mint a fresh 5-minute session token and retry.",
			link: "https://reloop.sh/docs/errors",
		};
	}

	const normalizedEmail = verification.email.trim().toLowerCase();

	const foundUser = await db.query.user.findFirst({
		where: eq(user.email, normalizedEmail),
	});

	if (!foundUser) {
		return {
			ok: false,
			status: 403,
			code: "ACCOUNT_REQUIRED",
			message: "Reloop account required",
			why: `Verified identity '${normalizedEmail}' has no registered account at Reloop.`,
			fix: "Call POST /api/agents/v1/auth/signup using this same Bearer token to provision your account and workspace, then retry this request once.",
			link: "https://reloop.sh/docs/errors",
		};
	}

	if (isUserBanned(foundUser)) {
		return {
			ok: false,
			status: 403,
			code: "FORBIDDEN",
			message: "User account suspended",
			why: "This user account is currently banned or suspended.",
			fix: "Contact platform administrators if you believe this is in error.",
			link: "https://reloop.sh/docs/errors",
		};
	}

	let targetOrgId: string | null = null;
	const requestedOrgId = headers.get("x-organization-id")?.trim();

	if (requestedOrgId) {
		const membership = await db.query.member.findFirst({
			where: and(
				eq(member.userId, foundUser.id),
				eq(member.organizationId, requestedOrgId),
			),
		});
		if (!membership) {
			return {
				ok: false,
				status: 403,
				code: "ORGANIZATION_ACCESS_DENIED",
				message: `You do not have access to workspace '${requestedOrgId}'.`,
				why: `Account '${normalizedEmail}' is not a member of organization '${requestedOrgId}'.`,
				fix: "Remove the 'x-organization-id' header to use your default workspace, or specify an organization you belong to.",
				link: "https://reloop.sh/docs/errors",
			};
		}
		targetOrgId = requestedOrgId;
	} else if (foundUser.activeOrganizationId) {
		const activeMembership = await db.query.member.findFirst({
			where: and(
				eq(member.userId, foundUser.id),
				eq(member.organizationId, foundUser.activeOrganizationId),
			),
		});
		if (activeMembership) {
			targetOrgId = foundUser.activeOrganizationId;
		}
	}

	if (!targetOrgId) {
		const firstMember = await db.query.member.findFirst({
			where: eq(member.userId, foundUser.id),
			orderBy: (table, { asc }) => [asc(table.createdAt)],
		});
		if (firstMember) {
			targetOrgId = firstMember.organizationId;
		}
	}

	if (opts.requireOrg && !targetOrgId) {
		return {
			ok: false,
			status: 403,
			code: "ACCOUNT_REQUIRED",
			message: "Workspace required",
			why: `Account '${normalizedEmail}' does not belong to any active workspace.`,
			fix: "Call POST /api/agents/v1/auth/signup to initialize a default workspace for this account.",
			link: "https://reloop.sh/docs/errors",
		};
	}

	return {
		ok: true,
		ctx: {
			userId: foundUser.id,
			organizationId: targetOrgId,
			platformRole: foundUser.role,
			authType: "agentonboard",
			agentEmail: normalizedEmail,
		},
	};
}

/**
 * Lean resolver compatible with AuthContext resolver chaining.
 */
export async function resolveAgentOnboardAuth(
	headers: Headers,
	deps: ResolverDeps,
	opts: { requireOrg: boolean } = { requireOrg: true },
): Promise<AuthContext | null> {
	const resolution = await resolveAgentOnboardAuthDetails(headers, deps, opts);
	if (!resolution.ok) return null;
	return resolution.ctx;
}
