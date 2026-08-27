import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";

/** Loading stand-in for step 2 — static copy is real; only the action pulses. */
export function StepTwoSkeleton() {
	return (
		<div aria-busy="true" aria-live="polite">
			<div className="px-5 pt-8 sm:px-8 lg:px-12">
				<div className="font-medium text-text-soft-400 text-xs">
					Step 2 of 2
				</div>
			</div>

			<div className="flex min-w-0 flex-col gap-4 px-5 pt-2 pb-8 sm:px-8 sm:pb-10 lg:px-12">
				<h1 className="mb-4 font-semibold text-[26px] text-text-strong-950 tracking-tight">
					Generate API key
				</h1>
				<div className="flex flex-col items-center px-6 py-12 text-center">
					<div className="mb-6 flex items-center justify-center">
						<Icon name="key-new" className="h-10 w-10 text-text-sub-600" />
					</div>
					<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
						Create your API key
					</h3>
					<p className="mx-auto mb-6 max-w-lg text-balance font-medium text-[12px] text-text-sub-600">
						This key lets your app send emails through Reloop. Copy it now — for
						security, we won&apos;t show it again.
					</p>
					<Skeleton className="h-9 w-[140px] rounded-xl" />
				</div>
			</div>
		</div>
	);
}
