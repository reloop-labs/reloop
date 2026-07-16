import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/templates")({
	component: () => <Outlet />,
});
