"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionQuery } from "#/features/auth/session-query";
import { DashboardLoadingChrome } from "#/features/dashboard/dashboard-loading-chrome";
import { ActiveOrganizationProvider } from "#/features/dashboard/page-header/use-active-organization";

export function ProtectedLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { data: session, isPending, isFetched } = useSessionQuery();

	useEffect(() => {
		if (isPending || !isFetched) return;
		if (!session) {
			router.replace("/login");
		}
	}, [isFetched, isPending, router, session]);

	// Confirmed signed-out: keep dashboard chrome while redirecting to login
	// (never swap to a full-viewport spinner after the shell has been shown).
	if (isFetched && !session) {
		return <DashboardLoadingChrome />;
	}

	// Keep this provider mounted while the session settles and while navigating
	// between dashboard and full-screen protected routes.
	return <ActiveOrganizationProvider>{children}</ActiveOrganizationProvider>;
}
