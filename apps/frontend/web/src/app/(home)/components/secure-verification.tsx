import { Check, ScanFace, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function SecureVerification() {
	return (
		<section
			aria-labelledby="secure-verification-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1102px)_minmax(24px,1fr)] gap-x-px bg-[#ebebeb] max-[1099px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
				/>

				{/* 2-column main split */}
				<div className="grid grid-cols-1 gap-px bg-[#ebebeb] lg:grid-cols-2 dark:bg-[#292929]">
					{/* Left Column: Visual Scanner Grid */}
					<div className="flex h-full items-center justify-center overflow-hidden bg-white p-4 sm:p-6 lg:p-8 dark:bg-black">
						<div className="mx-auto w-full self-center">
							<div aria-hidden="true" className="relative">
								<div className="grid grid-cols-4 gap-px bg-[#ebebeb] dark:bg-[#292929]">
									{/* Left Grid Rows */}
									<div className="grid grid-rows-3 gap-y-px bg-[#ebebeb] dark:bg-[#292929]">
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
										<div
											data-grid-content="true"
											className="flex h-full min-h-[60px] items-center justify-center bg-white p-4 sm:p-6 dark:bg-black"
										>
											<div className="group relative my-auto aspect-square size-fit opacity-75 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] hover:opacity-95">
												<img
													alt="Identity verification portrait"
													loading="lazy"
													width={200}
													height={133}
													className="size-full rounded object-cover"
													src="https://raw.githubusercontent.com/tailark/assets/refs/heads/main/portrait_vsoxqd.jpg"
												/>
											</div>
										</div>
										<div
											data-grid-content="true"
											className="h-full min-h-[60px] bg-white dark:bg-black"
										/>
									</div>

									{/* Center Column: Identity Verification Cards */}
									<div className="col-span-2 space-y-px bg-[#ebebeb] dark:bg-[#292929]">
										{/* Card 1: Name, Email, Phone Metadata */}
										<div
											data-grid-content="true"
											className="h-fit bg-white p-6 dark:bg-black"
										>
											<div className="w-full space-y-1 text-sm">
												<span className="mb-3 block size-12 rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />
												<div className="grid grid-cols-[auto_1fr] items-center">
													<span className="block w-18 text-xs text-zinc-500 dark:text-zinc-400">
														Name
													</span>
													<span className="h-2 w-1/4 rounded-full bg-zinc-200 px-2 dark:bg-zinc-800" />
												</div>
												<div className="grid grid-cols-[auto_1fr] items-center">
													<span className="block w-18 text-xs text-zinc-500 dark:text-zinc-400">
														Email
													</span>
													<span className="h-2 w-1/2 rounded-full bg-zinc-200 px-2 dark:bg-zinc-800" />
												</div>
												<div className="grid grid-cols-[auto_1fr] items-center">
													<span className="block w-18 text-xs text-zinc-500 dark:text-zinc-400">
														Phone
													</span>
													<span className="h-2 w-3/4 rounded-full bg-zinc-200 px-2 dark:bg-zinc-800" />
												</div>
											</div>
										</div>

										{/* Card 2: Interactive ID Scanner with Frame & Reticle */}
										<div
											data-grid-content="true"
											className="relative h-fit bg-white p-2 dark:bg-black"
										>
											<div className="relative rounded-xl border border-zinc-200/90 bg-white p-6 shadow-black/5 shadow-xl ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
												<div>
													<div
														aria-hidden="true"
														className="group relative mx-auto mt-4 w-4/6"
													>
														{/* Ambient Glow */}
														<div className="absolute inset-0 animate-spin opacity-50 blur-lg duration-[3s]">
															<div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-300 to-indigo-300" />
														</div>

														{/* Scan Line Glow */}
														<div className="absolute inset-0 z-10">
															<div className="absolute inset-x-0 m-auto h-6 bg-white blur-xl" />
														</div>

														{/* Targeting Reticle Frame */}
														<div className="absolute inset-0 z-10 m-auto aspect-[2/3] w-8 border border-emerald-300/20 bg-emerald-300/15 sm:w-14">
															<span className="absolute -top-px -left-px z-10 block size-2.5 rounded-tl border-emerald-400 border-t-[1.5px] border-l-[1.5px]" />
															<span className="absolute -top-px -right-px z-10 block size-2.5 rounded-tr border-emerald-400 border-t-[1.5px] border-r-[1.5px]" />
															<span className="absolute -bottom-px -left-px z-10 block size-2.5 rounded-bl border-emerald-400 border-b-[1.5px] border-l-[1.5px]" />
															<span className="absolute -right-px -bottom-px z-10 block size-2.5 rounded-br border-emerald-400 border-r-[1.5px] border-b-[1.5px]" />
														</div>

														{/* Masked Portrait Photo */}
														<div className="aspect-square max-w-xs [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
															<img
																alt="Verification scan target"
																loading="lazy"
																width={200}
																height={133}
																className="size-full rounded object-cover"
																src="https://raw.githubusercontent.com/tailark/assets/refs/heads/main/portrait_vsoxqd.jpg"
															/>
														</div>
													</div>

													{/* User Identity Info */}
													<div className="mt-4 flex h-14 items-center justify-center">
														<div className="mx-auto my-auto h-fit w-full text-center">
															<p className="font-mono text-xs text-zinc-950 uppercase dark:text-white">
																Méschac Irung
															</p>
															<p className="text-xs text-zinc-500 dark:text-zinc-400">
																CEO, Acme
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>

										{/* Card 3: Verified Badge */}
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
													Verified
												</span>
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
											className="flex h-full min-h-[60px] items-center justify-center bg-white p-4 sm:p-6 dark:bg-black"
										>
											<div className="group relative my-auto aspect-square size-fit opacity-75 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] hover:opacity-95">
												<img
													alt="Identity verification portrait"
													loading="lazy"
													width={200}
													height={133}
													className="size-full rounded object-cover"
													src="https://raw.githubusercontent.com/tailark/assets/refs/heads/main/portrait_vsoxqd.jpg"
												/>
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
						className="flex h-full flex-col space-y-6 rounded-[4px] bg-white p-6 sm:p-8 lg:p-12 dark:bg-black"
					>
						{/* Icon Circle */}
						<div className="flex size-12 rounded-full bg-white shadow-black/5 shadow-xl ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
							<ScanFace
								aria-hidden
								className="m-auto size-4 text-zinc-500 dark:text-zinc-400"
							/>
						</div>

						{/* Headline */}
						<h2
							id="secure-verification-heading"
							className="font-semibold text-3xl text-zinc-950 dark:text-white"
						>
							Secure ID Verification
						</h2>

						{/* Description */}
						<p className="text-balance text-zinc-600 dark:text-zinc-400">
							Ensure the safety and security of your operations with our{" "}
							<strong className="font-semibold text-zinc-950 dark:text-white">
								comprehensive ID verification
							</strong>{" "}
							solutions.
						</p>

						{/* Checklist */}
						<ul className="w-full space-y-2">
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>Instant Identity Checks</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>Fraud Prevention</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<Check
									className="size-4 shrink-0 text-emerald-500"
									strokeWidth={2}
								/>
								<span>Global Coverage</span>
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

				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
				/>
			</div>
		</section>
	);
}
