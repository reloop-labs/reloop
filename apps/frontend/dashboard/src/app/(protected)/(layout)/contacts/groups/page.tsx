import { GroupList } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/groups/group-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Groups · Reloop",
	description: "Manage your contact groups.",
};

const GroupsPage = () => {
	return (
		<div className="mt-4">
			<GroupList />
		</div>
	);
};

export default GroupsPage;
