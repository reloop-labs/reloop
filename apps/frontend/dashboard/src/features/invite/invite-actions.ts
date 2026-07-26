import { authClient } from "@reloop/auth/client";
import { isInvitationActionable } from "#/utils/invitations";

export interface Invitation {
	id: string;
	organizationId: string;
	email: string;
	role: string;
	status: string;
	expiresAt: Date | string;
	inviterId: string;
	organizationName: string;
	organizationSlug?: string;
	organizationLogo?: string | null;
	inviterEmail: string;
}

export type InvitationClient = {
	acceptInvitation: (input: { invitationId: string }) => Promise<{
		data?: { invitation?: { organizationId?: string | null } | null } | null;
		error?: { message?: string } | null;
	}>;
	setActive: (input: { organizationId: string }) => Promise<unknown>;
	updateUser: (input: { activeOrganizationId: string }) => Promise<unknown>;
};

export async function acceptAndActivateInvitation(
	invitationId: string,
	client: InvitationClient = {
		acceptInvitation: (input) =>
			authClient.organization.acceptInvitation(input),
		setActive: (input) => authClient.organization.setActive(input),
		updateUser: (input) => authClient.updateUser(input),
	},
) {
	const { error, data } = await client.acceptInvitation({ invitationId });
	if (error) {
		return { ok: false as const, message: error.message };
	}

	const organizationId = data?.invitation?.organizationId;
	if (organizationId) {
		await client.setActive({ organizationId });
		await client.updateUser({ activeOrganizationId: organizationId });
	}

	return { ok: true as const, organizationId: organizationId ?? null };
}

export function invitationIsUsable(invitation: Invitation | null) {
	return invitation ? isInvitationActionable(invitation) : false;
}
