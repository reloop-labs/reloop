"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionQuery } from "#/features/auth/session-query";
import { DashboardLoadingChrome } from "#/features/dashboard/dashboard-loading-chrome";
import { ActiveOrganizationProvider } from "#/features/dashboard/page-header/use-active-organization";
import { useRedirectIfSetupRequired } from "#/features/setup/use-setup-status";

export function ProtectedLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { data: session, isPending, isFetched } = useSessionQuery();

	const isSignedOut = isFetched && !isPending && !session;
	const { shouldBlockForSetup } = useRedirectIfSetupRequired(isSignedOut);

	useEffect(() => {
		if (isPending || !isFetched) return;
		if (!session && !shouldBlockForSetup) {
			router.replace("/login");
		}
	}, [isFetched, isPending, router, session, shouldBlockForSetup]);

	if (isPending || !isFetched) {
		return <DashboardLoadingChrome />;
	}

	// Confirmed signed-out: keep dashboard chrome while redirecting to login
	// (never swap to a full-viewport spinner after the shell has been shown).
	if (!session) {
		return <DashboardLoadingChrome />;
	}

	// Keep this provider mounted while the session settles and while navigating
	// between dashboard and full-screen protected routes.
	return <ActiveOrganizationProvider>{children}</ActiveOrganizationProvider>;
}
