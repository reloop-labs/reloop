import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/webhooks")({
	component: () => <Outlet />,
});
