import { GroupList } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/groups/group-list";
import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
