import { DashboardLoadingChrome } from "#/features/dashboard/dashboard-loading-chrome";

/**
 * Instant loading UI for authenticated routes.
 * Matches dashboard chrome so hard refresh never flashes a full-viewport spinner.
 */
export default function ProtectedLoading() {
	return <DashboardLoadingChrome />;
}
