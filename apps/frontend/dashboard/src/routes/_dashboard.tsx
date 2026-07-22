import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { organizationsQueryOptions } from "#/features/auth/organizations-query";
import {
	sessionQueryOptions,
	useSessionQuery,
} from "#/features/auth/session-query";
import { DashboardContentSkeleton } from "#/features/dashboard/dashboard-content-skeleton";
import { DashboardShell } from "#/features/dashboard/dashboard-shell";
import { ActiveOrganizationProvider } from "#/features/dashboard/page-header/use-active-organization";

export const Route = createFileRoute("/_dashboard")({
	// Prefetch session early so the layout does not wait on a nested effect.
	// Browser-only: `@reloop/auth/client` uses a same-origin relative base when
	// VITE_PUBLIC_URL is unset. Node `fetch` cannot parse relative URLs, so SSR
	// beforeLoad would throw "Failed to parse URL from /api/auth/...".
	beforeLoad: async ({ context }) => {
		if (typeof window === "undefined") return;
		const session = await context.queryClient.ensureQueryData(
			sessionQueryOptions(),
		);
		if (session?.user?.id) {
			void context.queryClient.prefetchQuery(organizationsQueryOptions());
		}
	},
	component: DashboardLayout,
});

function DashboardLayout() {
	const navigate = useNavigate();
	const { data: session, isPending, isFetched } = useSessionQuery();

	useEffect(() => {
		// Only redirect after the query has settled with no session.
		if (isPending || !isFetched) return;
		if (!session) {
			void navigate({ to: "/login", search: { inviteId: undefined } });
		}
	}, [session, isPending, isFetched, navigate]);

	// Session settled empty → full-screen loader while we navigate to login
	// (avoids flashing dashboard chrome for unauthenticated users).
	if (isFetched && !session) {
		return <AuthSessionLoader />;
	}

	// Keep the org provider mounted across session-pending → ready so bootstrap
	// state is not reset mid-load. Shell chrome paints immediately with a
	// content skeleton until session exists.
	return (
		<ActiveOrganizationProvider>
			<DashboardShell>
				{isPending || !session ? <DashboardContentSkeleton /> : <Outlet />}
			</DashboardShell>
		</ActiveOrganizationProvider>
	);
}
