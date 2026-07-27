import { isInvitationActionable } from "#/utils/invitations";

type Invitation = {
	id?: string;
	status: string;
	expiresAt: Date | string;
};

export function resolveOrglessDestination({
	pathname,
	organizations,
	invitations,
	invitationsSettled,
}: {
	pathname: string;
	organizations: unknown[] | undefined;
	invitations: Invitation[] | undefined;
	invitationsSettled: boolean;
}): string | null {
	if (
		pathname === "/onboarding" ||
		organizations === undefined ||
		organizations.length > 0 ||
		!invitationsSettled
	) {
		return null;
	}

	const actionableInvitation = invitations?.find((invitation) =>
		isInvitationActionable(invitation),
	);
	return actionableInvitation?.id
		? `/invite?id=${encodeURIComponent(actionableInvitation.id)}`
		: "/onboarding";
}
