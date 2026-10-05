import { Check, Copy, Mail, Server, ShieldCheck } from "lucide-react";
import Link from "next/link";

const credentialRows = [
	{ label: "Host", value: "smtp.reloop.sh", mono: true },
	{ label: "Port", value: "587 · STARTTLS", mono: true },
	{ label: "Username", value: "reloop_api_key", mono: true },
];

export function SecureVerification() {
	return (
		<section
			aria-labelledby="smtp-section-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				{/* 2-column main split */}
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 border-stroke-soft-100 border-t lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-white/10 dark:border-white/10">
					{/* Left Column: SMTP visual */}
					<div className="flex h-full items-center justify-center overflow-hidden bg-white p-4 sm:p-6 lg:p-8 dark:bg-black">
						<div className="mx-auto w-full self-center">
							<div aria-hidden="true" className="relative">
								<div className="grid grid-cols-4 gap-px bg-stroke-soft-100 dark:bg-white/10">
									{/* Left Grid Rows */}
									<div className="grid grid-rows-3 gap-y-px bg-stroke-soft-100 dark:bg-white/10">
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
										<div
											data-grid-content="true"
											className="flex h-full min-h-[60px] items-center justify-center bg-white p-4 sm:p-6 dark:bg-black"
										>
											<div className="flex size-16 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 opacity-60 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:border-zinc-800 dark:bg-zinc-900">
												<Mail className="size-5 text-zinc-400 dark:text-zinc-500" />
											</div>
										</div>
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
									</div>

									{/* Center Column: SMTP Cards */}
									<div className="col-span-2 space-y-px bg-stroke-soft-100 dark:bg-white/10">
										{/* Card 1: Endpoint metadata */}
										<div
											data-grid-content="true"
											className="h-fit bg-white p-6 dark:bg-black"
										>
											<div className="w-full space-y-1 text-sm">
												<span className="mb-3 flex size-12 items-center justify-center rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
													<Server className="size-5 text-zinc-400 dark:text-zinc-500" />
												</span>
												<div className="grid grid-cols-[auto_1fr] items-center gap-2">
													<span className="block w-18 text-xs text-zinc-500 dark:text-zinc-400">
														Host
													</span>
													<span className="w-fit rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
														smtp.reloop.sh
													</span>
												</div>
												<div className="grid grid-cols-[auto_1fr] items-center gap-2">
													<span className="block w-18 text-xs text-zinc-500 dark:text-zinc-400">
														Port
													</span>
													<span className="w-fit rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
														587
													</span>
												</div>
												<div className="grid grid-cols-[auto_1fr] items-center gap-2">
													<span className="block w-18 text-xs text-zinc-500 dark:text-zinc-400">
														Security
													</span>
													<span className="w-fit rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
														STARTTLS
													</span>
												</div>
											</div>
										</div>

										{/* Card 2: SMTP credentials */}
										<div
											data-grid-content="true"
											className="relative h-fit bg-white p-2 dark:bg-black"
										>
											<div className="relative rounded-xl border border-zinc-200/90 bg-white p-6 shadow-black/5 shadow-xl ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
												<div>
													<div className="flex items-center justify-between">
														<p className="font-mono text-[11px] text-zinc-500 uppercase dark:text-zinc-400">
															smtp credentials
														</p>
														<span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700 ring-1 ring-emerald-200/60 ring-inset dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/50">
															TLS
														</span>
													</div>

													<div className="mt-4 space-y-2">
														{credentialRows.map((row) => (
															<div
																key={row.label}
																className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200/80 bg-zinc-50/60 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/50"
															>
																<div className="min-w-0">
																	<p className="text-[11px] text-zinc-500 dark:text-zinc-400">
																		{row.label}
																	</p>
																	<p className="truncate font-mono text-xs text-zinc-900 dark:text-zinc-100">
																		{row.value}
																	</p>
																</div>
																<span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
																	<Copy className="size-3.5" />
																</span>
															</div>
														))}
														<div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200/80 bg-zinc-50/60 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/50">
															<div className="min-w-0">
																<p className="text-[11px] text-zinc-500 dark:text-zinc-400">
																	Password
																</p>
																<p className="font-mono text-xs text-zinc-900 tracking-widest dark:text-zinc-100">
																	••••••••••••
																</p>
															</div>
															<span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
																<Copy className="size-3.5" />
															</span>
														</div>
													</div>
												</div>
											</div>
										</div>

										{/* Card 3: Connected badge */}
										<div
											data-grid-content="true"
											className="h-fit bg-white p-6 dark:bg-black"
										>
											<div className="flex items-center gap-2">
												<ShieldCheck
													className="size-4 fill-emerald-100 text-emerald-600 dark:fill-emerald-950/60 dark:text-emerald-400"
													strokeWidth={2}
												/>
												<span className="rounded-full font-medium text-sm text-zinc-900 dark:text-zinc-100">
													Connected
												</span>
												<span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
													TLS secured
												</span>
											</div>
										</div>
									</div>

									{/* Right Grid Rows */}
									<div className="grid grid-rows-3 gap-y-px bg-stroke-soft-100 dark:bg-white/10">
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
										<div
											data-grid-content="true"
											className="flex h-full min-h-[60px] items-center justify-center bg-white p-4 sm:p-6 dark:bg-black"
										>
											<div className="flex size-16 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 opacity-60 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:border-zinc-800 dark:bg-zinc-900">
												<Mail className="size-5 text-zinc-400 dark:text-zinc-500" />
											</div>
										</div>
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column: Copy & Checklist */}
					<div
						data-grid-content="true"
						data-slot="feature-card-content"
						className="flex h-full flex-col space-y-6 bg-white p-6 sm:p-8 lg:p-12 dark:bg-black"
					>
						{/* Icon Circle */}
						<div className="flex size-12 rounded-full bg-white shadow-black/5 shadow-xl ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
							<Mail
								aria-hidden
								className="m-auto size-4 text-zinc-500 dark:text-zinc-400"
							/>
						</div>

						{/* Headline */}
						<h2
							id="smtp-section-heading"
							className="font-semibold text-3xl text-zinc-950 dark:text-white"
						>
							Send via SMTP
						</h2>

						{/* Description */}
						<p className="text-balance text-zinc-600 dark:text-zinc-400">
							Plug Reloop into any app or framework with{" "}
							<strong className="font-semibold text-zinc-950 dark:text-white">
								standard SMTP credentials
							</strong>
							. One endpoint, encrypted by default, ready in
							minutes.
						</p>

						{/* Checklist */}
						<ul className="w-full space-y-2">
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>Works with any framework or language</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>TLS encrypted over ports 587 & 465</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>Dedicated credentials with instant rotation</span>
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
				</div>
			</div>
		</section>
	);
}
