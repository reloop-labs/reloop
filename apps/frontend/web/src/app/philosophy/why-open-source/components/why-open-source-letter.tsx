export function WhyOpenSourceLetter() {
	return (
		<section className="relative w-full max-w-full overflow-x-clip border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 px-6 pt-28 pb-14 sm:px-10 sm:pt-32 sm:pb-16 md:max-w-7xl lg:px-12 xl:border-x dark:border-white/10">
				<div className="mx-auto w-full max-w-3xl font-sans">
					<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10 dark:bg-white/[0.03]">
						<div className="m-0.5 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 py-7 sm:px-10 sm:py-10 md:px-12 md:py-12 dark:border-white/10 dark:bg-[#0c0c0c]">
							{/* Letter Header */}
							<header className="mb-6 flex items-center justify-between border-b border-stroke-soft-200 pb-5 dark:border-white/10">
								<div>
									<h1 className="font-semibold text-[18px] text-text-strong-950 leading-snug tracking-tight sm:text-[22px] dark:text-white">
										Why Open Source
									</h1>
									<p className="mt-1 font-mono text-[12px] text-text-sub-600 dark:text-white/45">
										A note from Reloop Labs
									</p>
								</div>
								<p className="shrink-0 font-mono text-[12px] text-text-sub-600 dark:text-white/50">
									2026
								</p>
							</header>

							{/* Letter Body */}
							<div className="space-y-4 text-[14.5px] text-text-sub-600 leading-relaxed sm:text-[15.5px] dark:text-white/70">
								<p className="font-medium text-text-strong-950 dark:text-white">
									Linux, Postgres, Redis, Nginx: the boring foundations of the internet are open. Email sits in that category. If it fails, users can&apos;t log in, can&apos;t reset passwords, and can&apos;t get receipts.
								</p>

								<p>
									Open source is how we make the four things above credible. You can read how delivery works. You can leave without rewriting your notification stack. The roadmap gets shaped by people shipping real mail, not only by a pricing page.
								</p>

								<p className="font-medium text-text-strong-950 dark:text-white">
									We&apos;re not open-sourcing a demo. Reloop Cloud and Reloop open source are the same product—same APIs whether you use hosted or self-host.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
