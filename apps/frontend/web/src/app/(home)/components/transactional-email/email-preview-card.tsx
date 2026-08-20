export function EmailPreviewCard({
	badge,
	heading,
	body,
	cta,
}: {
	badge: string;
	heading: string;
	body: string;
	cta: string;
}) {
	return (
		<article className="w-full overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_24px_60px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-[#141414] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
			<div className="flex items-center justify-between px-5 pt-4 pb-3">
				<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
					Email preview
				</p>
				<span className="rounded-full bg-bg-weak-50 px-2 py-0.5 font-medium text-[11px] text-text-sub-600 dark:bg-white/[0.06] dark:text-white/50">
					{badge}
				</span>
			</div>

			<div className="mx-5 mb-5 overflow-hidden rounded-xl border border-stroke-soft-200 dark:border-white/10">
				<div className="border-stroke-soft-200 border-b px-4 py-3 dark:border-white/10">
					<div className="flex items-center gap-2">
						<span className="flex size-7 items-center justify-center rounded-md bg-text-strong-950 font-bold text-[12px] text-white dark:bg-white dark:text-black">
							A
						</span>
						<div>
							<p className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
								Acme
							</p>
							<p className="text-[11px] text-text-soft-400 dark:text-white/40">
								onboarding@acme.dev
							</p>
						</div>
					</div>
				</div>
				<div className="px-4 py-5">
					<h3 className="font-semibold text-[18px] text-text-strong-950 leading-snug tracking-tight dark:text-white">
						{heading}
					</h3>
					<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/55">
						{body}
					</p>
					<span className="mt-5 inline-flex items-center rounded-lg bg-text-strong-950 px-4 py-2 font-medium text-[12.5px] text-white dark:bg-white dark:text-black">
						{cta}
					</span>
				</div>
			</div>
		</article>
	);
}
