import { Icon } from "@reloop/ui/icon";

/** Placeholder until the logs feature is ported to dashboard-v1. */
export function ActivitySection() {
	return (
		<section className="mt-10">
			<div className="mb-3 flex items-center gap-2">
				<Icon name="logs" className="h-4 w-4 text-text-sub-600" />
				<h2 className="font-semibold text-label-md text-text-strong-950">
					Activity
				</h2>
			</div>
			<div className="flex flex-col items-center rounded-2xl border border-stroke-soft-100 border-dashed px-6 py-12 text-center dark:border-stroke-soft-100/40">
				<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-stroke-soft-100/40">
					<Icon name="history" className="h-4 w-4 text-text-sub-600" />
				</div>
				<p className="font-medium text-sm text-text-strong-950">
					Request logs for this key
				</p>
				<p className="mt-1 max-w-sm text-paragraph-xs text-text-sub-600">
					Activity and request history will show here once the logs view is
					ported to this dashboard.
				</p>
			</div>
		</section>
	);
}
