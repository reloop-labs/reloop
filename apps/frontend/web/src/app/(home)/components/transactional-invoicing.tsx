import { Check, Scroll } from "lucide-react";
import Link from "next/link";

export function TransactionalInvoicing() {
	return (
		<section
			aria-labelledby="transactional-invoicing-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1102px)_minmax(24px,1fr)] gap-x-px bg-[#ebebeb] max-[1099px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
				/>

				{/* 2-column main split */}
				<div className="grid grid-cols-1 gap-px bg-[#ebebeb] lg:grid-cols-2 dark:bg-[#292929]">
					{/* Left Column: Styled exactly to reference card specification */}
					<div
						data-grid-content="true"
						data-slot="feature-card-content"
						className="flex h-full flex-col space-y-6 rounded-[4px] bg-white p-6 sm:p-8 lg:p-12 dark:bg-black"
					>
						{/* Icon Circle */}
						<div className="flex size-12 rounded-full bg-white shadow-black/5 shadow-xl ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
							<Scroll
								aria-hidden
								className="m-auto size-4 text-zinc-500 dark:text-zinc-400"
							/>
						</div>

						{/* Headline */}
						<h2
							id="transactional-invoicing-heading"
							className="font-semibold text-3xl text-zinc-950 dark:text-white"
						>
							Innovative Invoicing Solutions
						</h2>

						{/* Description */}
						<p className="text-balance text-zinc-600 dark:text-zinc-400">
							Elevate your delivery with our{" "}
							<strong className="font-semibold text-zinc-950 dark:text-white">
								dedicated IP reputation
							</strong>{" "}
							and transactional deliverability tools designed to ensure invoices
							and receipts land directly in the inbox.
						</p>

						{/* Checklist */}
						<ul className="w-full space-y-2">
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>Automated Invoice & Receipt Delivery</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>Dedicated IP Pools & Reputation Warmup</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>Real-time Deliverability & Blocklist Tracking</span>
							</li>
						</ul>

						{/* Action Button */}
						<Link
							href="/features/transaction-emails"
							className="mt-auto inline-flex h-8 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent bg-white px-3 font-medium text-xs text-zinc-900 shadow-black/15 shadow-sm ring-1 ring-zinc-950/10 transition-colors duration-200 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/15 dark:hover:bg-zinc-800"
						>
							Learn more
						</Link>
					</div>

					{/* Right Column: Visual Invoicing & Delivery Grid from reference */}
					<div className="flex h-full items-center justify-center overflow-hidden bg-white dark:bg-black">
						<div className="mx-auto w-full self-center">
							<div aria-hidden="true" className="relative">
								<div className="grid @3xl:grid-cols-4 grid-cols-7 gap-px bg-[#ebebeb] dark:bg-[#292929]">
									{/* Left Grid Rows */}
									<div className="grid grid-rows-3 gap-y-px bg-[#ebebeb] dark:bg-[#292929]">
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
									</div>

									{/* Center Column: Invoice Cards */}
									<div className="@3xl:col-span-2 col-span-5 space-y-px bg-[#ebebeb] dark:bg-[#292929]">
										{/* To / From / Address Card */}
										<div
											data-grid-content="true"
											className="h-fit bg-white p-6 dark:bg-black"
										>
											<div className="w-full space-y-1 text-sm">
												<div className="grid grid-cols-[auto_1fr] items-center">
													<span className="block w-18 text-xs text-zinc-500 dark:text-zinc-400">
														To
													</span>
													<span className="h-2 w-1/4 rounded-full bg-zinc-200 px-2 dark:bg-zinc-800" />
												</div>
												<div className="grid grid-cols-[auto_1fr] items-center">
													<span className="block w-18 text-xs text-zinc-500 dark:text-zinc-400">
														From
													</span>
													<span className="h-2 w-1/2 rounded-full bg-zinc-200 px-2 dark:bg-zinc-800" />
												</div>
												<div className="grid grid-cols-[auto_1fr] items-center">
													<span className="block w-18 text-xs text-zinc-500 dark:text-zinc-400">
														Address
													</span>
													<span className="h-2 w-3/4 rounded-full bg-zinc-200 px-2 dark:bg-zinc-800" />
												</div>
											</div>
										</div>

										{/* Main Elevated Invoice Card with Gradient Glow */}
										<div
											data-grid-content="true"
											className="relative h-fit bg-white p-2 dark:bg-black"
										>
											<div className="absolute inset-4 bg-gradient-to-r from-purple-500 via-amber-500 to-indigo-500 opacity-25 blur-2xl" />
											<div className="relative rounded-xl border border-zinc-200/90 bg-white p-6 shadow-black/5 shadow-xl ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
												<div className="mb-6 flex items-start justify-between">
													<div className="space-y-0.5">
														<svg
															width="18"
															height="18"
															viewBox="0 0 18 18"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
															className="size-5"
														>
															<path
																d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z"
																fill="url(#logo-gradient)"
															/>
															<defs>
																<linearGradient
																	id="logo-gradient"
																	x1="10"
																	y1="0"
																	x2="10"
																	y2="20"
																	gradientUnits="userSpaceOnUse"
																>
																	<stop stopColor="#9B99FE" />
																	<stop offset="1" stopColor="#2BC8B7" />
																</linearGradient>
															</defs>
														</svg>
														<div className="mt-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
															INV-456789
														</div>
														<div className="-translate-x-1 mt-1 font-mono font-semibold text-2xl text-zinc-950 dark:text-white">
															$284,342.57
														</div>
														<div className="font-medium text-xs text-zinc-600 dark:text-zinc-400">
															Due in 15 days
														</div>
													</div>
												</div>
												<div className="mt-6 flex h-16 items-center justify-center rounded-md border border-zinc-950/15 border-dashed bg-zinc-950/[0.03] dark:border-white/15 dark:bg-white/[0.03]">
													<div className="border-zinc-950/35 border-b px-6 font-serif text-lg text-zinc-950/50 dark:border-white/35 dark:text-white/50">
														Sign here
													</div>
												</div>
											</div>
										</div>

										{/* Secondary Peeking Invoice */}
										<div
											data-grid-content="true"
											className="h-fit bg-white p-6 dark:bg-black"
										>
											<div className="flex items-start justify-between">
												<div className="space-y-0.5">
													<svg
														width="18"
														height="18"
														viewBox="0 0 18 18"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
														className="size-5 text-zinc-900 opacity-50 dark:text-white"
													>
														<path
															d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z"
															fill="currentColor"
														/>
													</svg>
													<div className="mt-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
														INV-456349
													</div>
													<div className="-translate-x-1 mt-1 font-mono font-semibold text-2xl text-zinc-950 dark:text-white">
														$57,452.64
													</div>
													<div className="font-medium text-xs text-zinc-600 dark:text-zinc-400">
														Due today
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Right Grid Rows */}
									<div className="grid grid-rows-3 gap-y-px bg-[#ebebeb] dark:bg-[#292929]">
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
				/>
			</div>
		</section>
	);
}
