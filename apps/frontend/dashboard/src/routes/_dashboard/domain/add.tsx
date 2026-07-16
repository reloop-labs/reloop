import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/domain/add")({
	component: () => <Outlet />,
});
