import { DashboardLoadingChrome } from "#/features/dashboard/dashboard-loading-chrome";

/**
 * Root instant loading UI.
 *
 * Prefer shell-matching chrome over a full-viewport spinner. Auth routes under
 * `(public)` / `(standalone)` supply their own `loading.tsx` with AuthSessionLoader.
 */
export default function Loading() {
	return <DashboardLoadingChrome />;
}
