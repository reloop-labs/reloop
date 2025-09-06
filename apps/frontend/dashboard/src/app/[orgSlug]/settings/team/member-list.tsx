import { authClient } from "@reloop/auth/client";
import useSWR from "swr";

export const MemberList = () => {
	const { data: session } = authClient.useSession();
	const { data, isLoading } = useSWR(
		"organization-member",
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
