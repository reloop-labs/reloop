import { Check, Wallet } from "lucide-react";
import Link from "next/link";

export function PaymentSolutions() {
	return (
		<section
			aria-labelledby="payment-solutions-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				{/* 2-column main split */}
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 border-stroke-soft-100 border-t lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-white/10 dark:border-white/10">
					{/* Left Column: Copy & Checklist */}
					<div
						data-grid-content="true"
						data-slot="feature-card-content"
						className="flex h-full flex-col space-y-6 bg-white p-6 sm:p-8 lg:p-12 dark:bg-black"
					>
						{/* Icon Circle */}
						<div className="flex size-12 rounded-full bg-white shadow-black/5 shadow-xl ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
							<Wallet
								aria-hidden
								className="m-auto size-4 text-zinc-500 dark:text-zinc-400"
							/>
						</div>

						{/* Headline */}
						<h2
							id="payment-solutions-heading"
							className="font-semibold text-3xl text-zinc-950 dark:text-white"
						>
							Pricing that won&apos;t burn your wallet
						</h2>

						{/* Description */}
						<p className="text-balance text-zinc-600 dark:text-zinc-400">
							Choose{" "}
							<strong className="font-semibold text-zinc-950 dark:text-white">
								monthly or credits
							</strong>{" "}
							— whatever fits how you send. Credits last 3 months
							on a rolling basis, so you never pay for what you
							don&apos;t use.
						</p>

						{/* Checklist */}
						<ul className="w-full space-y-2">
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>Monthly plan for predictable sending</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>Credits for flexible, pay-as-you-go</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>
									Credits valid 3 months, rolling — switch anytime
								</span>
							</li>
						</ul>

						{/* Action Button */}
						<Link
							href="/pricing"
							className="mt-auto inline-flex h-8 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent bg-white px-3 font-medium text-xs text-zinc-900 shadow-black/15 shadow-sm ring-1 ring-zinc-950/10 transition-colors duration-200 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/15 dark:hover:bg-zinc-800"
						>
							See pricing
						</Link>
					</div>

					{/* Right Column: Monthly / Credits visual */}
					<div className="flex h-full items-center justify-center overflow-hidden bg-white p-4 sm:p-6 lg:p-8 dark:bg-black">
						<div className="mx-auto w-full self-center">
							<div aria-hidden="true" className="grid h-full grid-cols-6 gap-px bg-stroke-soft-100 dark:bg-white/10">
								{/* Left Grid Rows */}
								<div className="grid grid-rows-3 gap-y-px bg-stroke-soft-100 dark:bg-white/10">
									<div
										data-grid-content="true"
										className="h-full min-h-[50px] bg-white p-2 dark:bg-black"
									/>
									<div
										data-grid-content="true"
										className="h-full min-h-[50px] bg-white p-2 dark:bg-black"
									/>
									<div
										data-grid-content="true"
										className="h-full min-h-[50px] bg-white p-2 dark:bg-black"
									/>
								</div>

								{/* Center Column: Billing card */}
								<div className="col-span-4 grid grid-rows-[1fr_auto_1fr] gap-y-px bg-stroke-soft-100 dark:bg-white/10">
									<div
										data-grid-content="true"
										className="min-h-[40px] bg-white dark:bg-black"
									/>

									{/* Visual billing card */}
									<div
										data-grid-content="true"
										className="relative h-fit bg-white p-2 dark:bg-black"
									>
										<div className="relative z-10 w-full overflow-hidden rounded-2xl border border-stroke-soft-100 bg-white px-6 py-5 shadow-2xl shadow-emerald-950/15 ring-1 ring-zinc-950/10 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none dark:ring-white/15">
											{/* Toggle: Monthly / Credits */}
											<div className="flex items-center justify-between">
												<div className="flex rounded-full border border-stroke-soft-100 bg-zinc-50 p-1 dark:border-white/10 dark:bg-zinc-950">
													<span className="rounded-full bg-white px-3 py-1 font-medium text-[11px] text-zinc-900 shadow-sm ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:text-white dark:ring-white/10">
														Monthly
													</span>
													<span className="px-3 py-1 font-medium text-[11px] text-zinc-500 dark:text-zinc-400">
														Credits
													</span>
												</div>
												<span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700 ring-1 ring-emerald-200/60 ring-inset dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/50">
													3-mo rolling
												</span>
											</div>

											{/* Balance */}
											<div className="mt-4 flex items-end justify-between">
												<div className="space-y-0.5">
													<span className="block text-xs text-zinc-500 dark:text-zinc-400">
														Credit balance
													</span>
													<span className="block font-medium font-mono text-sm text-zinc-950 dark:text-white">
														48,200 / 50,000
													</span>
												</div>
												<div className="space-y-0.5 text-right">
													<span className="block text-xs text-zinc-500 dark:text-zinc-400">
														Valid
													</span>
													<span className="block font-medium font-mono text-sm text-zinc-950 dark:text-white">
														3 months
													</span>
												</div>
											</div>

											{/* Rolling bar */}
											<div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
												<div className="h-full w-[68%] rounded-full bg-emerald-500" />
											</div>
											<p className="mt-2 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
												Rolls forward every month — never
												expires in under 3 months
											</p>
										</div>
									</div>

									{/* Bottom 3 reassurance cells */}
									<div className="grid grid-cols-3 gap-x-px bg-stroke-soft-100 dark:bg-white/10">
										<div
											data-grid-content="true"
											className="flex items-center justify-center bg-white p-4 dark:bg-black"
										>
											<span className="font-medium text-[11px] text-zinc-500 dark:text-zinc-400">
												Monthly
											</span>
										</div>
										<div
											data-grid-content="true"
											className="flex items-center justify-center bg-white p-4 dark:bg-black"
										>
											<span className="font-medium text-[11px] text-zinc-500 dark:text-zinc-400">
												Credits
											</span>
										</div>
										<div
											data-grid-content="true"
											className="flex items-center justify-center bg-white p-4 dark:bg-black"
										>
											<span className="font-medium text-[11px] text-zinc-500 dark:text-zinc-400">
												3-mo rollover
											</span>
										</div>
									</div>
								</div>

								{/* Right Grid Rows */}
								<div className="grid grid-rows-3 gap-y-px bg-stroke-soft-100 dark:bg-white/10">
									<div
										data-grid-content="true"
										className="h-full min-h-[50px] bg-white p-2 dark:bg-black"
									/>
									<div
										data-grid-content="true"
										className="h-full min-h-[50px] bg-white p-2 dark:bg-black"
									/>
									<div
										data-grid-content="true"
										className="h-full min-h-[50px] bg-white p-2 dark:bg-black"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
