import { authClient } from "@reloop/auth/client";
import type { QueryClient } from "@tanstack/react-query";
import {
	organizationsQueryOptions,
	userInvitationsQueryOptions,
} from "#/features/auth/organizations-query";
import { isInvitationActionable } from "./invitations";

export type PostAuthDestinationOptions = {
	/** Deep-linked organization invitation id (from `?inviteId=`). */
	inviteId?: string | null;
	/** Deep-linked target redirect path/URL post-auth (from `?redirectTo=` or `?redirect=`). */
	redirectTo?: string | null;
};

type OrganizationListResult = {
	data?: Array<unknown> | null;
};

type InvitationListResult = {
	data?: Array<{
		id: string;
		status: string;
		expiresAt: Date | string;
	}> | null;
};

export type PostAuthDestinationDeps = {
	listOrganizations: () => Promise<OrganizationListResult>;
	listUserInvitations: () => Promise<InvitationListResult>;
};

/**
 * Validates and sanitizes a return target URL to prevent open redirect vulnerabilities.
 * Accepts relative paths (starting with `/` but not `//`) or HTTP/HTTPS URLs matching local/prod domains.
 */
export function sanitizeRedirectUrl(redirectTo?: string | null): string | null {
	if (!redirectTo) return null;
	const trimmed = redirectTo.trim();
	if (!trimmed) return null;

	if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
		return trimmed;
	}

	try {
		const parsed = new URL(trimmed);
		const host = parsed.hostname;
		if (
			host === "local.reloop.sh" ||
			host.endsWith(".local.reloop.sh") ||
			host === "reloop.sh" ||
			host.endsWith(".reloop.sh")
		) {
			return trimmed;
		}
	} catch {
		// Ignore parsing failure
	}

	return null;
}

/**
 * Default deps call Better Auth directly. Prefer
 * `resolvePostAuthDestinationWithQuery` so results share the RQ cache.
 */
const defaultDeps: PostAuthDestinationDeps = {
	listOrganizations: async () => authClient.organization.list(),
	listUserInvitations: async () =>
		authClient.organization.listUserInvitations(),
};

/**
 * Where a freshly authenticated user should land.
 *
 * Priority:
 * 1. Explicit redirect parameter (`?redirectTo=`)
 * 2. Explicit invite deep link → accept page
 * 3. Existing organization membership → dashboard home
 * 4. Actionable pending invite (not expired) → accept page
 * 5. Otherwise → onboarding (create a workspace)
 *
 * Paths are router-relative (basepath `/dashboard` is applied by the router).
 */
export async function resolvePostAuthDestination(
	options: PostAuthDestinationOptions = {},
	deps: PostAuthDestinationDeps = defaultDeps,
): Promise<string> {
	const sanitizedRedirect = sanitizeRedirectUrl(options.redirectTo);
	if (sanitizedRedirect) {
		return sanitizedRedirect;
	}

	const inviteId = options.inviteId?.trim();
	if (inviteId) {
		return `/invite?id=${encodeURIComponent(inviteId)}`;
	}

	try {
		const { data: organizations } = await deps.listOrganizations();
		if (organizations && organizations.length > 0) {
			return "/";
		}
	} catch {
		// Fall through — treat list failure as orgless and keep routing.
	}

	try {
		const { data: invitations } = await deps.listUserInvitations();
		const actionable = invitations?.find((invite) =>
			isInvitationActionable(invite),
		);
		if (actionable?.id) {
			return `/invite?id=${encodeURIComponent(actionable.id)}`;
		}
	} catch {
		// Fall through to onboarding.
	}

	return "/onboarding";
}

/**
 * Resolve destination using the shared TanStack Query cache.
 *
 * Uses `fetchQuery` (not `ensureQueryData`) so routing never trusts a stale
 * empty org list — e.g. after creating a workspace during onboarding, the
 * cache may still hold `[]` until a network refetch completes. Returning that
 * empty array would incorrectly send the user back to `/onboarding`.
 */
export async function resolvePostAuthDestinationWithQuery(
	queryClient: QueryClient,
	options: PostAuthDestinationOptions = {},
): Promise<string> {
	return resolvePostAuthDestination(options, {
		listOrganizations: async () => {
			const data = await queryClient.fetchQuery(organizationsQueryOptions());
			return { data };
		},
		listUserInvitations: async () => {
			const data = await queryClient.fetchQuery(userInvitationsQueryOptions());
			return { data };
		},
	});
}
