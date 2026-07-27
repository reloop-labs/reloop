"use client";

import { usePathname } from "next/navigation";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { DashboardLoadingChrome } from "#/features/dashboard/dashboard-loading-chrome";

/**
 * Paths that should not show dashboard chrome while the root Nuqs/search-params
 * Suspense boundary is resolving (hard refresh).
 *
 * `usePathname()` is basePath-stripped by Next (`/dashboard` → `/` for home).
 */
function isAuthOrStandalonePath(pathname: string): boolean {
	const path = pathname || "/";
	return (
		path.startsWith("/login") ||
		path.startsWith("/signup") ||
		path.startsWith("/verify") ||
		path.startsWith("/invite") ||
		path.startsWith("/onboarding") ||
		path.startsWith("/accept-invitation")
	);
}

/**
 * Fallback for the root Suspense around `NuqsAdapter`.
 *
 * Using `AuthSessionLoader` here was the hard-refresh flash: SSR painted the
 * sidebar, then `useSearchParams` suspended and replaced the whole tree with a
 * full-viewport spinner.
 */
export function ProvidersSuspenseFallback() {
	const pathname = usePathname() ?? "/";

	if (isAuthOrStandalonePath(pathname)) {
		return <AuthSessionLoader />;
	}

	return <DashboardLoadingChrome />;
}
