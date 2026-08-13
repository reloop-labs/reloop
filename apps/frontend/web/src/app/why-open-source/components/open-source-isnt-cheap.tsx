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
					className="-top-2.5 absolute left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-2deg] rounded-[1px] bg-[#f0e6c0]/90 shadow-sm dark:bg-[#4a4334]/90"
					style={{
						backgroundImage:
							"linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
					}}
				/>

				<p className="font-medium text-[10px] text-[#8a7a55] uppercase tracking-[0.16em] dark:text-[#a89870]">
					A note
				</p>

				<div className="mt-3 space-y-2.5 text-[12.5px] text-[#3d3420] leading-[1.55] sm:text-[13px] dark:text-[#e8dfc8]/88">
					<p className="font-semibold text-[15px] text-[#1f1a10] leading-snug tracking-tight sm:text-[16px] dark:text-[#f5efdc]">
						Open source isn&apos;t cheap.
					</p>

					<p>
						You might think it is. If the code is public, why would anyone
						pay for it?
					</p>

					<p className="font-medium text-[#1f1a10] dark:text-[#f5efdc]">
						But look around. The internet runs on it.
					</p>

					<ul className="list-none space-y-1 pl-0 text-[#3d3420]/90 dark:text-[#e8dfc8]/75">
						<li>Google · Stripe · startups · your tools</li>
						<li>Linux · Postgres · K8s · React</li>
					</ul>

					<p className="border-[#e0d4b0] border-t pt-2.5 font-semibold text-[#1f1a10] dark:border-[#3a3428] dark:text-[#f5efdc]">
						Not the cheap alternative. The foundation.
					</p>

					<p>
						So why treat email infrastructure differently?
					</p>

					<p className="font-medium text-[#1f1a10] italic dark:text-[#f5efdc]">
						That&apos;s why we built Reloop.
					</p>
				</div>
			</article>
		</aside>
	);
}
