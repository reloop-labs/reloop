/**
 * Placeholder for the main content panel while session is still resolving.
 * Keeps chrome (sidebar/header) stable so first paint isn't a blank spinner.
 */
export function DashboardContentSkeleton() {
	return (
		<div
			className="mx-auto max-w-7xl animate-pulse space-y-8 p-6 lg:p-8"
			aria-busy="true"
			aria-live="polite"
		>
			<span className="sr-only">Loading dashboard</span>
			<div className="space-y-2">
				<div className="h-4 w-32 rounded bg-bg-weak-50 dark:bg-white/10" />
				<div className="h-9 w-64 rounded bg-bg-weak-50 dark:bg-white/10" />
			</div>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<div className="h-56 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 md:col-span-2 dark:border-white/5 dark:bg-white/[0.02]" />
				<div className="h-56 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-white/5 dark:bg-white/[0.02]" />
				<div className="h-56 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-white/5 dark:bg-white/[0.02]" />
				<div className="h-56 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-white/5 dark:bg-white/[0.02]" />
				<div className="h-56 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-white/5 dark:bg-white/[0.02]" />
			</div>
		</div>
	);
}
