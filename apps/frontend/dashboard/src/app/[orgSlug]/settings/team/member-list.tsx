import { authClient } from "@reloop/auth/client";
import useSWR from "swr";

export const MemberList = () => {
	const { data: session } = authClient.useSession();
	const { data, isLoading } = useSWR(
		"organization-member",
		async () => (await authClient.organization.listMembers({})).data,
	);
	console.log("🚀 ~ MemberList ~ data:", data);
	return <div> MemberList</div>;
};
