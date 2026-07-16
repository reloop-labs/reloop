import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout for /domain, /domain/add, /domain/$domainId — must render Outlet. */
export const Route = createFileRoute("/_dashboard/domain")({
	component: () => <Outlet />,
});
