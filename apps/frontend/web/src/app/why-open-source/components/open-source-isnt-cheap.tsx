/**
 * Compact sticky-note callout for the why-open-source sidebar.
 * Short version of "open source isn't cheap" — sits next to the main essay.
 */
export function OpenSourceIsntCheap() {
	return (
		<aside className="relative w-full lg:sticky lg:top-28">
			<div
				aria-hidden
				className="absolute inset-1.5 translate-y-0.5 rounded-sm bg-black/[0.04] blur-[1.5px] dark:bg-black/40"
			/>

			<article
				className="relative rotate-[-0.8deg] rounded-sm border border-[#e8dfc8] bg-[#fff9e8] px-4 py-5 shadow-[0_10px_28px_-14px_rgba(40,30,10,0.3)] sm:px-5 sm:py-6 dark:border-[#3a3428] dark:bg-[#1c1914] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.65)]"
				style={{
					backgroundImage:
						"repeating-linear-gradient(transparent, transparent 23px, rgba(180,160,100,0.11) 24px)",
				}}
			>
				{/* Tape */}
				<div
					aria-hidden
					className="-top-2.5 -translate-x-1/2 absolute left-1/2 h-5 w-16 rotate-[-2deg] rounded-[1px] bg-[#f0e6c0]/90 shadow-sm dark:bg-[#4a4334]/90"
					style={{
						backgroundImage:
							"linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
					}}
				/>

				<p className="font-medium text-[#8a7a55] text-[10px] uppercase tracking-[0.16em] dark:text-[#a89870]">
					A note
				</p>

				<div className="mt-3 space-y-3 text-[#3d3420] text-[12.5px] leading-[1.55] sm:text-[13px] dark:text-[#e8dfc8]/88">
					<p className="font-semibold text-[#1f1a10] text-[15px] leading-snug tracking-tight sm:text-[16px] dark:text-[#f5efdc]">
						Open source isn&apos;t cheap.
					</p>

					<div className="space-y-1">
						<p>Cheap means no one paid.</p>
						<p className="font-medium text-[#1f1a10] dark:text-[#f5efdc]">
							This means someone paid &mdash; just not you.
						</p>
					</div>

					<div className="space-y-1 rounded border border-[#e0d4b0]/70 bg-[#f7f0dc]/50 px-3 py-2 text-[#3d3420]/90 dark:border-[#3a3428]/80 dark:bg-[#25211b]/50 dark:text-[#e8dfc8]/85">
						<p className="font-medium text-[#1f1a10] text-[12.5px] tracking-tight dark:text-[#f5efdc]">
							Linux &middot; Postgres &middot; K8s &middot; React
						</p>
						<p className="text-[#8a7a55] text-[12px] dark:text-[#a89870]">
							Free to use. Never free to build.
						</p>
					</div>

					<p>Email infrastructure deserves the same honesty.</p>

					<p className="font-medium text-[#1f1a10] italic dark:text-[#f5efdc]">
						That&apos;s why we built Reloop.
					</p>

					<p className="border-[#e0d4b0] border-t pt-3 font-semibold text-[#1f1a10] text-[12.5px] leading-snug sm:text-[13px] dark:border-[#3a3428] dark:text-[#f5efdc]">
						&ldquo;Take open source away for a week. Watch
						&apos;enterprise-grade&apos; collapse.&rdquo;
					</p>
				</div>
			</article>
		</aside>
	);
}
