import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { useSessionQuery } from "#/features/auth/session-query";
import { DashboardShell } from "#/features/dashboard/dashboard-shell";

export const Route = createFileRoute("/_dashboard")({
	component: DashboardLayout,
});

function DashboardLayout() {
	const navigate = useNavigate();
	const { data: session, isPending } = useSessionQuery();

	useEffect(() => {
		if (isPending) return;
		if (!session) {
			void navigate({ to: "/login", search: { inviteId: undefined } });
		}
	}, [session, isPending, navigate]);

	if (isPending || !session) {
		return <AuthSessionLoader />;
	}

	return (
		<DashboardShell>
			<Outlet />
		</DashboardShell>
	);
}
