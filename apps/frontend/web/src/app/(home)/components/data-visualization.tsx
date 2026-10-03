import {
	Activity,
	CalendarDays,
	Check,
	Clock2,
	Earth,
	TrendingUp,
	Zap,
} from "lucide-react";

export function DataVisualization() {
	return (
		<section
			aria-labelledby="data-visualization-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			{/* Top Header Block */}
			<div className="@container grid w-full grid-cols-[auto_1fr_auto] bg-[#ebebeb] lg:grid-cols-[1fr_auto_1fr] dark:bg-[#292929]">
				{/* Left Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="w-full p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>

				{/* Center Content: Headline & Subheadline */}
				<div className="mx-auto w-full max-w-276 max-w-[1280px] p-[0.5px] lg:min-w-276 lg:min-w-[1280px]">
					<div
						data-slot="content"
						className="h-full rounded bg-card/90 py-16 lg:py-24"
					>
						<div className="mx-auto max-w-2xl space-y-6 px-6 text-center">
							<h2
								id="data-visualization-heading"
								className="text-balance font-semibold text-4xl text-foreground lg:text-5xl"
							>
								Transform your data into visual insights
							</h2>
							<p className="text-balance text-lg text-muted-foreground">
								Our powerful analytics platform helps you visualize complex data,
								identify trends, and make data-driven decisions with confidence.
							</p>
						</div>
					</div>
				</div>

				{/* Right Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>
			</div>

			{/* Cards Grid Block */}
			<div className="@container grid w-full grid-cols-[auto_1fr_auto] bg-[#ebebeb] lg:grid-cols-[1fr_auto_1fr] dark:bg-[#292929]">
				{/* Left Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="w-full p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>

				{/* Center Content: 10-column Modular Feature Grid */}
				<div className="mx-auto w-full max-w-276 max-w-[1280px] lg:min-w-276 lg:min-w-[1280px]">
					<div className="grid bg-[#ebebeb] *:p-[0.5px] **:data-grid-content:h-full **:data-grid-content:rounded **:data-grid-content:bg-card/90 dark:bg-[#292929]">
						<div className="grid grid-cols-1 gap-px @2xl:grid-cols-2 @4xl:grid-cols-10">
							{/* Left border cell on 4xl screens */}
							<div aria-hidden="true" className="@max-4xl:hidden">
								<div data-grid-content="true" />
							</div>

							{/* Card 1: Global Data Visualization (4 columns) */}
							<div className="@4xl:col-span-4">
								<div
									data-slot="feature-card"
									className="grid h-full grid-rows-[auto_1fr] gap-px bg-[#ebebeb] dark:bg-[#292929]"
								>
									{/* Card Content Header */}
									<div
										data-grid-content="true"
										data-slot="feature-card-content"
										className="space-y-4 p-6 @4xl:px-12 @4xl:pt-12"
									>
										<h3
											data-slot="feature-card-title"
											className="flex items-center gap-2 font-medium text-muted-foreground text-sm"
										>
											<Earth className="size-4" strokeWidth={2} />
											Global Data Visualization
										</h3>
										<p
											data-slot="feature-card-description"
											className="font-medium text-muted-foreground text-xl"
										>
											<span className="text-foreground">
												Visualize data globally.
											</span>{" "}
											Utilize interactive maps to enhance your data insights.
										</p>
									</div>

									{/* Card Illustration: World Map with Avatar Pins */}
									<div
										data-grid-content="true"
										data-slot="feature-card-illustration"
										className="relative flex flex-col items-center justify-center overflow-hidden px-4 pb-6 pt-6 @4xl:px-0 @4xl:pb-12"
									>
										<div className="relative w-full max-w-md self-center @4xl:-mx-16">
											{/* Avatar Pins positioned across world regions */}
											<div aria-hidden="true" className="absolute inset-0 z-10 pointer-events-none">
												{/* Pin 1: North America */}
												<div className="absolute top-[28%] left-[26%] z-10 -translate-x-1/2 -translate-y-1/2">
													<div className="relative flex items-center justify-center">
														<span className="absolute size-8 animate-ping rounded-full bg-emerald-400/25 duration-1000" />
														<div className="size-7 rounded-full bg-white p-0.5 shadow-black/15 shadow-md ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/20">
															<img
																className="size-full rounded-full object-cover"
																src="https://avatars.githubusercontent.com/u/99137927?v=4"
																alt="Glodie"
																width={28}
																height={28}
															/>
														</div>
													</div>
												</div>

												{/* Pin 2: Europe */}
												<div className="absolute top-[32%] left-[54%] z-10 -translate-x-1/2 -translate-y-1/2">
													<div className="relative flex items-center justify-center">
														<span className="absolute size-8 animate-ping rounded-full bg-blue-400/25 duration-1000" />
														<div className="size-7 rounded-full bg-white p-0.5 shadow-black/15 shadow-md ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/20">
															<img
																className="size-full rounded-full object-cover"
																src="https://avatars.githubusercontent.com/u/68236786?v=4"
																alt="Theo"
																width={28}
																height={28}
															/>
														</div>
													</div>
												</div>

												{/* Pin 3: Asia Pacific */}
												<div className="absolute top-[48%] left-[76%] z-10 -translate-x-1/2 -translate-y-1/2">
													<div className="relative flex items-center justify-center">
														<span className="absolute size-8 animate-ping rounded-full bg-violet-400/25 duration-1000" />
														<div className="size-7 rounded-full bg-white p-0.5 shadow-black/15 shadow-md ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/20">
															<img
																className="size-full rounded-full object-cover"
																src="https://avatars.githubusercontent.com/u/31113941?v=4"
																alt="Bernard"
																width={28}
																height={28}
															/>
														</div>
													</div>
												</div>
											</div>

											{/* High-Resolution Clean Stylized Dotted World Map */}
											<div
												aria-hidden="true"
												className="relative aspect-[2/1] w-full scale-105 opacity-80 transition-opacity hover:opacity-100 dark:opacity-60"
											>
												<svg
													viewBox="0 0 1000 500"
													className="size-full fill-zinc-300 dark:fill-zinc-700"
													xmlns="http://www.w3.org/2000/svg"
												>
													{/* Continents Simplified Geometric Polygons */}
													{/* North America */}
													<path d="M120 110 L260 70 L340 100 L320 160 L280 180 L250 250 L200 240 L160 180 Z" opacity="0.4" />
													{/* South America */}
													<path d="M260 270 L340 290 L320 400 L270 440 L240 340 Z" opacity="0.4" />
													{/* Europe */}
													<path d="M470 90 L560 80 L580 140 L520 170 L460 140 Z" opacity="0.4" />
													{/* Africa */}
													<path d="M460 190 L570 180 L600 280 L540 370 L480 320 L440 230 Z" opacity="0.4" />
													{/* Asia */}
													<path d="M590 80 L840 80 L880 200 L760 260 L640 220 L580 150 Z" opacity="0.4" />
													{/* Australia */}
													<path d="M760 320 L860 310 L870 380 L780 400 Z" opacity="0.4" />

													{/* Subtle Grid Coordinates */}
													<line x1="0" y1="125" x2="1000" y2="125" stroke="currentColor" strokeDasharray="3 6" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />
													<line x1="0" y1="250" x2="1000" y2="250" stroke="currentColor" strokeDasharray="3 6" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />
													<line x1="0" y1="375" x2="1000" y2="375" stroke="currentColor" strokeDasharray="3 6" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />
													<line x1="250" y1="0" x2="250" y2="500" stroke="currentColor" strokeDasharray="3 6" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />
													<line x1="500" y1="0" x2="500" y2="500" stroke="currentColor" strokeDasharray="3 6" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />
													<line x1="750" y1="0" x2="750" y2="500" stroke="currentColor" strokeDasharray="3 6" strokeWidth="0.5" className="text-zinc-200 dark:text-zinc-800" />
												</svg>

												{/* Radial Vignette mask for depth */}
												<div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-white dark:to-black" />
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Card 2: Real-Time Deliverability Intelligence (4 columns) */}
							<div className="@4xl:col-span-4">
								<div
									data-slot="feature-card"
									className="grid h-full grid-rows-[auto_1fr] gap-px bg-[#ebebeb] dark:bg-[#292929]"
								>
									{/* Card Content Header */}
									<div
										data-grid-content="true"
										data-slot="feature-card-content"
										className="space-y-4 p-6 @4xl:px-12 @4xl:pt-12"
									>
										<h3
											data-slot="feature-card-title"
											className="flex items-center gap-2 font-medium text-muted-foreground text-sm"
										>
											<Activity className="size-4" strokeWidth={2} />
											Deliverability Intelligence
										</h3>
										<p
											data-slot="feature-card-description"
											className="font-medium text-muted-foreground text-xl"
										>
											<span className="text-foreground">
												Live inbox placement.
											</span>{" "}
											Track delivery latencies, ISP throttling, and IP reputation in real time.
										</p>
									</div>

									{/* Card Illustration: Deliverability Metric Monitor */}
									<div
										data-grid-content="true"
										data-slot="feature-card-illustration"
										className="flex flex-col justify-center p-6 sm:p-8 @4xl:p-12"
									>
										<div className="w-full space-y-4 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
											{/* Top Stat Row */}
											<div className="flex items-center justify-between">
												<div>
													<span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
														Inbox Rate
													</span>
													<div className="flex items-baseline gap-2">
														<span className="font-semibold text-2xl text-foreground">
															99.84%
														</span>
														<span className="flex items-center font-medium text-emerald-600 text-xs dark:text-emerald-400">
															<TrendingUp className="mr-0.5 size-3" />
															+1.2%
														</span>
													</div>
												</div>
												<div className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-600 text-xs dark:text-emerald-400">
													Optimal
												</div>
											</div>

											{/* ISP Placement Breakdown Bars */}
											<div className="space-y-2.5 pt-2">
												<div className="space-y-1">
													<div className="flex justify-between font-mono text-xs text-muted-foreground">
														<span>Gmail</span>
														<span className="font-medium text-foreground">99.9%</span>
													</div>
													<div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
														<div className="h-full w-[99.9%] rounded-full bg-emerald-500" />
													</div>
												</div>

												<div className="space-y-1">
													<div className="flex justify-between font-mono text-xs text-muted-foreground">
														<span>Microsoft Outlook / 365</span>
														<span className="font-medium text-foreground">99.7%</span>
													</div>
													<div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
														<div className="h-full w-[99.7%] rounded-full bg-emerald-500" />
													</div>
												</div>

												<div className="space-y-1">
													<div className="flex justify-between font-mono text-xs text-muted-foreground">
														<span>Apple Mail / iCloud</span>
														<span className="font-medium text-foreground">100.0%</span>
													</div>
													<div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
														<div className="h-full w-full rounded-full bg-emerald-500" />
													</div>
												</div>
											</div>

											{/* Status Badges */}
											<div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
												<span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] text-zinc-700 shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10">
													<Check className="size-3 text-emerald-500" />
													DKIM Signed
												</span>
												<span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] text-zinc-700 shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10">
													<Check className="size-3 text-emerald-500" />
													DMARC Pass
												</span>
												<span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] text-zinc-700 shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10">
													<Check className="size-3 text-emerald-500" />
													Dedicated Warm IP
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Right border cell on 4xl screens */}
							<div aria-hidden="true" className="@max-4xl:hidden">
								<div data-grid-content="true" />
							</div>
						</div>
					</div>
				</div>

				{/* Right Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>
			</div>

			{/* Bottom Features Row (Without Separator) */}
			<div className="@container grid w-full grid-cols-[auto_1fr_auto] bg-[#ebebeb] lg:grid-cols-[1fr_auto_1fr] dark:bg-[#292929]">
				{/* Left Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="w-full p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>

				{/* Center Content: 8-column 3/4-item grid */}
				<div className="mx-auto w-full max-w-276 max-w-[1280px] lg:min-w-276 lg:min-w-[1280px]">
					<div className="grid grid-cols-2 bg-[#ebebeb] *:p-[0.5px] **:data-grid-content:h-full **:data-grid-content:rounded **:data-grid-content:bg-card/90 **:data-grid-content:p-6 @4xl:grid-cols-10 @4xl:**:data-grid-content:p-8 @5xl:**:data-grid-content:p-12 dark:bg-[#292929]">
						<div aria-hidden="true" className="@max-4xl:hidden">
							<div data-grid-content="true" />
						</div>
						<div className="col-span-8 grid gap-px @4xl:grid-cols-3 @sm:grid-cols-2">
							<div className="@4xl:last:hidden">
								<div data-grid-content="true" className="space-y-3">
									<Clock2 className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Time Management
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Effectively manage your time with precision and speed using our tools.
									</p>
								</div>
							</div>
							<div className="@4xl:last:hidden">
								<div data-grid-content="true" className="space-y-3">
									<Zap className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Instant Performance
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Experience lightning-fast processing and quick responses.
									</p>
								</div>
							</div>
							<div className="@4xl:last:hidden">
								<div data-grid-content="true" className="space-y-3">
									<CalendarDays className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Schedule Management
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Organize your tasks seamlessly with our integrated calendar.
									</p>
								</div>
							</div>
							<div className="@4xl:last:hidden">
								<div data-grid-content="true" className="space-y-3">
									<CalendarDays className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Event Planning
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Plan and keep track of your events effortlessly.
									</p>
								</div>
							</div>
						</div>
						<div aria-hidden="true" className="@max-4xl:hidden">
							<div data-grid-content="true" />
						</div>
					</div>
				</div>

				{/* Right Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>
			</div>
		</section>
	);
}
