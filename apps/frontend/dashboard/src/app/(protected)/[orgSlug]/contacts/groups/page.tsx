import type { Metadata } from "next";
import { GroupList } from "../components/group-list";

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
