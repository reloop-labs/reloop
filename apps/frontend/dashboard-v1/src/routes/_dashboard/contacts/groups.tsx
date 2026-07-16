import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout for /contacts/groups and /contacts/groups/$groupId */
export const Route = createFileRoute("/_dashboard/contacts/groups")({
	component: () => <Outlet />,
});
