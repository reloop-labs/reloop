import { authClient } from "@reloop/auth/client";
import { isInvitationActionable } from "./invitations";

export type PostAuthDestinationOptions = {
	/** Deep-linked organization invitation id (from `?inviteId=`). */
	inviteId?: string | null;
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

const defaultDeps: PostAuthDestinationDeps = {
	listOrganizations: async () => authClient.organization.list(),
	listUserInvitations: async () =>
		authClient.organization.listUserInvitations(),
};

/**
 * Where a freshly authenticated user should land.
 *
 * Priority:
 * 1. Explicit invite deep link → accept page
 * 2. Existing organization membership → dashboard home
 * 3. Actionable pending invite (not expired) → accept page
 * 4. Otherwise → onboarding (create a workspace)
 */
export async function resolvePostAuthDestination(
	options: PostAuthDestinationOptions = {},
	deps: PostAuthDestinationDeps = defaultDeps,
): Promise<string> {
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
