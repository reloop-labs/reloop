export function TemplatePane() {
	return (
		<div className="flex h-full min-h-[22rem] flex-col">
			<div className="flex shrink-0 items-center justify-between border-stroke-soft-200 border-b px-4 py-2.5 sm:px-5 dark:border-white/10">
				<div className="min-w-0">
					<p className="font-medium text-[12.5px] text-text-strong-950 dark:text-white">
						welcome.tsx
					</p>
					<p className="truncate text-[11px] text-text-soft-400 dark:text-white/40">
						Welcome to Acme · maya@northwind.io
					</p>
				</div>
				<span className="rounded-full bg-purple-500/10 px-2 py-0.5 font-medium text-[10px] text-purple-600 dark:text-purple-400">
					Template
				</span>
			</div>

			<div className="flex flex-1 items-center justify-center p-5 sm:p-6">
				<div className="w-full max-w-[22rem] rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 dark:border-white/10 dark:bg-[#0c0c0d]">
					<div className="flex items-center justify-between border-stroke-soft-200 border-b pb-3 dark:border-white/10">
						<div className="flex items-center gap-2">
							<span className="flex size-6 items-center justify-center rounded-md bg-text-strong-950 font-bold text-[11px] text-white dark:bg-white dark:text-black">
								A
							</span>
							<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
								Acme
							</span>
						</div>
						<span className="text-[11px] text-text-soft-400 dark:text-white/40">
							Transactional
						</span>
					</div>
					<div className="pt-4">
						<h3 className="font-semibold text-[16px] text-text-strong-950 leading-snug tracking-tight dark:text-white">
							Welcome to Acme, Maya
						</h3>
						<p className="mt-2 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
							Your workspace is ready. Confirm your email and send the first
							message in a few lines of code.
						</p>
						<span className="mt-4 inline-flex items-center rounded-lg bg-text-strong-950 px-3.5 py-2 font-medium text-[12px] text-white dark:bg-white dark:text-black">
							Confirm email
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
