export function QuickStart() {
	return (
		<section className="relative overflow-hidden border-stroke-soft-200 border-t bg-bg-weak-50/60 py-20 sm:py-28 dark:border-white/10 dark:bg-white/[0.02]">
			<div
				aria-hidden
				className="pointer-events-none absolute top-0 right-1/4 h-[400px] w-[600px] rounded-full bg-orange-500/10 opacity-70 blur-[120px] dark:opacity-40"
			/>
			<div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 md:max-w-7xl lg:px-8">
				<div className="mb-16 text-center sm:mb-20">
					<h2 className="font-semibold text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Setup in 5 Minutes
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/50">
						No sales calls or enterprise agreements. Build and send
						immediately.
					</p>
				</div>

				<div className="grid gap-px overflow-hidden rounded-2xl border border-stroke-soft-200 bg-stroke-soft-200 md:grid-cols-3 dark:border-white/10 dark:bg-white/10">
					<div className="flex flex-col justify-between bg-bg-white-0 p-8 lg:p-10 dark:bg-black">
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-bg-strong-950 font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								1
							</div>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								Generate Credentials
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
								Create an account, verify domain TXT records, and generate
								private API keys in the dashboard interface.
							</p>
						</div>
					</div>

					<div className="flex flex-col justify-between bg-bg-white-0 p-8 lg:p-10 dark:bg-black">
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-bg-strong-950 font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								2
							</div>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								Add Reloop SDK
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
								Install our client library package into your local codebase
								dependencies:
								<code className="mt-4 block rounded border border-white/5 bg-[#0a0a0a] p-2 font-mono text-[11.5px] text-violet-300">
									npm install reloop-email
								</code>
							</p>
						</div>
					</div>

					<div className="flex flex-col justify-between bg-bg-white-0 p-8 lg:p-10 dark:bg-black">
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-bg-strong-950 font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								3
							</div>
							<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
								Trigger Sends
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
								Point calls to the endpoints using payload templates, and view
								live audit trails in the platform dashboard.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
