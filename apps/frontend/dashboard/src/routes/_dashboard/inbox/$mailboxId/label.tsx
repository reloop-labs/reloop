import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/inbox/$mailboxId/label")({
	component: () => <Outlet />,
});
