import { createFileRoute } from "@tanstack/react-router";
import { GroupList } from "#/features/contacts/components/groups/group-list";

export const Route = createFileRoute("/_dashboard/contacts/groups")({
	component: GroupList,
	head: () => ({
		meta: [
			{ title: "Groups · Reloop" },
			{ name: "description", content: "Organize contacts into groups." },
		],
	}),
});
