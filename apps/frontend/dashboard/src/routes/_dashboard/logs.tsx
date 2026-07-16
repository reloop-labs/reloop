import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout for /logs and /logs/$logId — must render an Outlet. */
export const Route = createFileRoute("/_dashboard/logs")({
	component: () => <Outlet />,
});
