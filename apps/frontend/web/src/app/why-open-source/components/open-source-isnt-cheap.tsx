/**
 * Blueprint selection-frame callout for the why-open-source essay.
 * Same visual language as the about page engine frame:
 * rotated primary-blue border, corner handles, bottom badge,
 * plus ruled lines.
 * Copy is unchanged.
 */
export function OpenSourceIsntCheap() {
	return (
		<aside className="relative w-full">
			<div className="relative rotate-[1.2deg] border border-primary-base/90 bg-bg-white-0 p-6 sm:p-7 dark:bg-[#0a0a0a]">
				<span
					aria-hidden
					className="-top-1 -left-1 absolute size-2 border border-primary-base bg-white"
				/>
				<span
					aria-hidden
					className="-top-1 -right-1 absolute size-2 border border-primary-base bg-white"
				/>
				<span
					aria-hidden
					className="-bottom-1 -left-1 absolute size-2 border border-primary-base bg-white"
				/>
				<span
					aria-hidden
					className="-right-1 -bottom-1 absolute size-2 border border-primary-base bg-white"
				/>

				{/* ruled lines */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 opacity-100 dark:opacity-60"
					style={{
						backgroundImage:
							"repeating-linear-gradient(transparent, transparent 27px, rgba(110,119,129,0.14) 28px)",
					}}
				/>

				<div className="relative">
					<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-neutral-500">
						A note
					</p>

					<div className="mt-3 space-y-3 text-[15px] leading-[1.7]">
						<p className="font-semibold text-[17px] text-text-strong-950 leading-snug tracking-tight dark:text-white">
							Open source isn&apos;t cheap.
						</p>

						<div className="space-y-1 text-text-strong-950 dark:text-neutral-200">
							<p>Free to use doesn&apos;t mean free to build.</p>
							<p className="font-medium">
								Someone cares for it &mdash; so everyone can use it.
							</p>
						</div>

						<div className="space-y-1 border border-primary-base/25 bg-primary-base/[0.06] px-3 py-2 dark:bg-primary-base/[0.1]">
							<p className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
								Linux &middot; Postgres &middot; K8s &middot; React
							</p>
							<p className="font-mono text-[12px] text-text-sub-600 dark:text-neutral-400">
								Free to use. Never free to build.
							</p>
						</div>

						<p className="text-text-strong-950 dark:text-neutral-200">
							Email infrastructure deserves the same honesty.
						</p>

						<p className="font-medium text-text-strong-950 italic dark:text-white">
							That&apos;s why we built Reloop.
						</p>

						<p className="border-stroke-soft-200 border-t pt-3 font-semibold text-[13.5px] text-text-strong-950 leading-snug dark:border-white/15 dark:text-white">
							&ldquo;Take open source away for a week. Watch
							&apos;enterprise-grade&apos; collapse.&rdquo;
						</p>
					</div>
				</div>

				<span className="-bottom-[26px] -translate-x-1/2 absolute left-1/2 rounded-[4px] bg-primary-base px-2 py-[3px] font-mono text-[11px] text-white leading-none">
					free to use × never free to build
				</span>
			</div>
			{/* spacer for the hanging badge */}
			<div aria-hidden className="h-7" />
		</aside>
	);
}
