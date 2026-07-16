import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/contacts/detail")({
	component: () => <Outlet />,
});
