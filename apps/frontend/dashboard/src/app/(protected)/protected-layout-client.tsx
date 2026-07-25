"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { useSessionQuery } from "#/features/auth/session-query";
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

	if (isFetched && !session) {
		return <AuthSessionLoader />;
	}

	// Keep this provider mounted while the session settles and while navigating
	// between dashboard and full-screen protected routes.
	return <ActiveOrganizationProvider>{children}</ActiveOrganizationProvider>;
}
