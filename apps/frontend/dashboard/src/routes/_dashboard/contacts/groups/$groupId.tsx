import { GroupDetailContent } from "#/features/contacts/group-detail/group-detail-content";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/contacts/groups/$groupId")({
	component: GroupDetailRoute,
	head: () => ({
		meta: [
			{ title: "Group Detail · Reloop" },
			{
				name: "description",
				content: "View and manage contact group details.",
			},
		],
	}),
});

function GroupDetailRoute() {
	const { groupId } = Route.useParams();
	return <GroupDetailContent groupId={groupId} />;
}
