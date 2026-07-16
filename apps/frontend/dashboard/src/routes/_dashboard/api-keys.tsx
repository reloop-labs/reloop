import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout for /api-keys and /api-keys/$apiKeyId — must render an Outlet. */
export const Route = createFileRoute("/_dashboard/api-keys")({
	component: () => <Outlet />,
});
