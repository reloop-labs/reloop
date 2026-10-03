import * as Button from "@reloop/ui/button";
import { BadgeCheck, Mail } from "lucide-react";
import Link from "next/link";

export function TransactionalEmails() {
	return (
		<section
			aria-labelledby="transactional-emails-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1280px)_minmax(24px,1fr)] gap-x-px bg-[#ebebeb] max-[1279px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1279px]:hidden dark:bg-black"
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
						<div className="flex size-12 rounded-full bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
							<Mail
								aria-hidden
								className="m-auto size-4 text-zinc-950 dark:text-white"
							/>
						</div>

						{/* Headline */}
						<h2
							id="transactional-emails-heading"
							className="font-semibold text-3xl text-zinc-950 dark:text-white"
						>
							Built for deliverability.
						</h2>

						{/* Description */}
						<p className="text-balance text-zinc-600 dark:text-zinc-400">
							Get your emails where they belong. We handle
							authentication, IP reputation and warmups so your
							messages land in inboxes, not spam folders.
						</p>

						{/* Checklist */}
						<ul className="w-full space-y-2">
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<BadgeCheck
									className="size-4 shrink-0 fill-zinc-950 text-white dark:fill-white dark:text-zinc-950"
									strokeWidth={2}
								/>
								<span>SPF, DKIM & DMARC Authentication</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<BadgeCheck
									className="size-4 shrink-0 fill-zinc-950 text-white dark:fill-white dark:text-zinc-950"
									strokeWidth={2}
								/>
								<span>IP Reputation & Warmup Management</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<BadgeCheck
									className="size-4 shrink-0 fill-zinc-950 text-white dark:fill-white dark:text-zinc-950"
									strokeWidth={2}
								/>
								<span>Real-time Deliverability & Blocklist Tracking</span>
							</li>
						</ul>

						{/* Action Button */}
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							asChild
							className="mt-auto w-fit"
						>
							<Link href="/features/transaction-emails">
								Learn more
							</Link>
						</Button.Root>
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

								{/* Center Column: Deliverability Snapshot */}
								<div className="@3xl:col-span-2 col-span-5 space-y-px bg-[#ebebeb] dark:bg-[#292929]">
									{/* Delivery notification */}
									<div
										data-grid-content="true"
										className="h-fit bg-white p-6 dark:bg-black"
									>
										<div className="flex items-center gap-3">
											<span
												aria-hidden
												className="relative flex size-2.5"
											>
												<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
												<span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
											</span>
											<p className="text-sm text-zinc-600 dark:text-zinc-400">
												<span className="font-mono text-xs">
													INV-456789
												</span>{" "}
												<span className="font-medium text-zinc-950 dark:text-white">
													delivered to inbox
												</span>{" "}
												· just now
											</p>
										</div>
									</div>

									{/* Main Elevated Invoice Card with Gradient Glow */}
									<div
										data-grid-content="true"
										className="relative h-fit bg-white p-2 dark:bg-black"
									>
										<div className="absolute inset-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 opacity-25 blur-2xl" />
										<div className="relative rounded-xl border border-zinc-200/90 bg-white p-6 shadow-black/5 shadow-xl ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
											<div className="space-y-0.5">
												<svg
													width="18"
													height="18"
													viewBox="0 0 18 18"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
													className="size-5"
													aria-hidden
												>
													<path
														d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z"
														fill="url(#invoice-logo-gradient)"
													/>
													<defs>
														<linearGradient
															id="invoice-logo-gradient"
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
											<div className="mt-6 flex h-16 items-center justify-center rounded-md border border-zinc-950/15 border-dashed bg-zinc-950/[0.03] dark:border-white/15 dark:bg-white/[0.03]">
												<div className="border-zinc-950/35 border-b px-6 font-serif text-lg text-zinc-950/50 dark:border-white/35 dark:text-white/50">
													Sign here
												</div>
											</div>
											<div className="my-5 border-zinc-200 border-t dark:border-zinc-800" />
											<ul className="space-y-2.5 text-sm">
												{[
													"SPF verified",
													"DKIM verified",
													"DMARC verified",
													"Dedicated IP",
												].map((check) => (
													<li
														key={check}
														className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400"
													>
														<BadgeCheck
															aria-hidden
															className="size-4 shrink-0 fill-zinc-950 text-white dark:fill-white dark:text-zinc-950"
														/>
														<span>{check}</span>
													</li>
												))}
											</ul>
										</div>
									</div>

									{/* Secondary Peeking Inbox Placement Card */}
									<div
										data-grid-content="true"
										className="h-fit bg-white p-6 dark:bg-black"
									>
										<div className="flex items-center justify-between">
											<p className="font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-400">
												Inbox placement
											</p>
											<p className="font-semibold text-xl text-zinc-950 tracking-tight dark:text-white">
												99.2%
											</p>
										</div>
										<div
											aria-hidden
											className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
										>
											<div className="h-full w-[99%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
										</div>
										<p className="mt-3 font-medium text-xs text-zinc-600 dark:text-zinc-400">
											12,482 delivered today · 37 bounced
										</p>
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
					className="rounded-[4px] bg-white max-[1279px]:hidden dark:bg-black"
				/>
			</div>
		</section>
	);
}
