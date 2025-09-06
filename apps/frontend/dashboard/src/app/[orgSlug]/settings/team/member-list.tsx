import { useUserOrganization } from "@dashboard/providers/org-provider";
import { authClient } from "@reloop/auth/client";
import useSWR from "swr";

export const MemberList = () => {
	const { activeOrganization } = useUserOrganization();
	const { data } = useSWR(
		`organization-member-${activeOrganization.id}`,
		async () => (await authClient.organization.listMembers({})).data,
	);
	return (
		<div>
			{data?.members?.map((member) => (
				<div className="flex justify-between">
					<div>{member.user.email}</div>
					<div>{member.role}</div>
				</div>
			))}
		</div>
	);
};
