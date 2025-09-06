import { useUserOrganization } from "@dashboard/providers/org-provider";
import { authClient } from "@reloop/auth/client";
import useSWR from "swr";

export const InviteList = () => {
	const { activeOrganization } = useUserOrganization();
	const {
		data: invites,
		isLoading,
		error,
	} = useSWR(
		"invitations",
		async () => (await authClient.organization.listInvitations()).data,
	);
	return (
		<div>
			{invites?.map((invite) => (
				<div className="flex justify-between">
					<div>{invite.email}</div>
					<div>{invite.role}</div>
					<div>{invite.status}</div>
					<div>{invite.expiresAt.toISOString()}</div>
					<div>{invite.inviterId}</div>
				</div>
			))}
		</div>
	);
};
