import { LoadingDot } from "../agent-inbox/components/shared/loading-dot";

/**
 * Placeholder for the main content panel while session is still resolving.
 * Displays the dot matrix loader animation centered in the content panel.
 */
export function DashboardContentSkeleton() {
	return (
		<div
			className="flex min-h-[400px] h-full w-full items-center justify-center text-text-strong-950 dark:text-white"
			aria-busy="true"
			aria-live="polite"
		>
			<span className="sr-only">Loading dashboard</span>
			<LoadingDot size={24} dotSize={3} />
		</div>
	);
}
