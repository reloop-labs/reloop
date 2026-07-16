import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings/billing")({
	component: BillingLayout,
});

function BillingLayout() {
	return <Outlet />;
}
