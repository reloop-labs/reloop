"use client";

const stepCardClassName =
	"flex flex-col justify-between border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 md:border-t md:border-l md:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] md:[&:nth-child(-n+3)]:border-t-0 md:[&:nth-child(3n+1)]:border-l-0";

export default function Guide() {
	return (
		<section
			id="guide"
			className="bg-[#f8f8f8] text-text-strong-950 dark:bg-black dark:text-white"
		>
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Launch in 3 steps
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						From template selection to your first send in minutes.
					</p>
				</div>

				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 md:grid-cols-3 dark:border-white/10">
					<div className={stepCardClassName}>
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								1
							</div>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								Choose a template
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Browse the library by category—newsletters, transactional,
								marketing—or start from a blank canvas.
							</p>
						</div>
					</div>

					<div className={stepCardClassName}>
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								2
							</div>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								Customize & preview
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Edit blocks in the visual editor, inject dynamic variables, and
								preview on desktop and mobile.
							</p>
						</div>
					</div>

					<div className={stepCardClassName}>
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								3
							</div>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								Send via API or campaign
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Reference your template ID from the SDK or schedule a broadcast
								from the dashboard.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
