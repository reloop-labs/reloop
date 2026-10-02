import {
	CalendarDays,
	Check,
	Clock2,
	Signature,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";

export function EnterpriseSecurity() {
	return (
		<section
			aria-labelledby="enterprise-security-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			{/* Part 1: Header Block */}
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

				{/* Center Content Column */}
				<div className="mx-auto w-full max-w-276 max-w-[1104px] p-[0.5px] lg:min-w-276 lg:min-w-[1104px]">
					<div
						data-slot="content"
						className="h-full rounded bg-card/90 py-16 lg:py-24"
					>
						<div className="mx-auto max-w-2xl space-y-6 px-6 text-center">
							<h2
								id="enterprise-security-heading"
								className="text-balance font-semibold text-4xl text-foreground lg:text-5xl"
							>
								Enterprise Grade Security
							</h2>
							<p className="text-balance text-lg text-muted-foreground">
								Reloop is built with the highest level of security in mind,
								ensuring that your data is protected from breaches and
								unauthorized access.
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

			{/* Part 2: Feature Grid Block */}
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

				{/* Center Content Column */}
				<div className="mx-auto w-full max-w-276 max-w-[1104px] lg:min-w-276 lg:min-w-[1104px]">
					<div className="grid bg-[#ebebeb] *:p-[0.5px] **:data-grid-content:h-full **:data-grid-content:rounded **:data-grid-content:bg-card/90 dark:bg-[#292929]">
						<div className="grid grid-cols-1 gap-px @2xl:grid-cols-2 @4xl:grid-cols-10">
							{/* Left border spacer on 4xl screens */}
							<div aria-hidden="true" className="@max-4xl:hidden">
								<div data-grid-content="true" />
							</div>

							{/* Left Card (4 cols): Scale to Infinity */}
							<div className="@4xl:col-span-4">
								<div
									data-slot="feature-card"
									className="grid h-full grid-rows-1 gap-px col-span-full @4xl:col-span-2"
								>
									<div
										data-grid-content="true"
										data-slot="feature-card-content"
										className="flex h-full flex-col space-y-6 p-6 @4xl:px-12 @4xl:pt-12 @4xl:pb-12"
									>
										{/* Icon Circle */}
										<div className="flex size-12 rounded-full bg-card shadow-black/5 shadow-xl ring-1 ring-foreground/5">
											<TrendingUp
												aria-hidden="true"
												className="m-auto size-4 text-muted-foreground"
											/>
										</div>

										{/* Title & Description */}
										<h3 className="font-semibold text-3xl text-foreground">
											Scale to Infinity
										</h3>
										<p className="text-balance text-muted-foreground">
											Reloop is built to handle the largest volumes of transactions
											with ease, ensuring that your business can scale to any
											size.
										</p>

										{/* Bullet Checklist */}
										<ul className="w-full space-y-2">
											<li className="flex items-center gap-2 text-muted-foreground text-sm">
												<Check
													className="size-4 shrink-0 text-emerald-500"
													strokeWidth={2}
												/>
												<span>Secure Credit Card Transactions</span>
											</li>
											<li className="flex items-center gap-2 text-muted-foreground text-sm">
												<Check
													className="size-4 shrink-0 text-emerald-500"
													strokeWidth={2}
												/>
												<span>Instant Payment Notifications</span>
											</li>
											<li className="flex items-center gap-2 text-muted-foreground text-sm">
												<Check
													className="size-4 shrink-0 text-emerald-500"
													strokeWidth={2}
												/>
												<span>Flexible Payment Options</span>
											</li>
										</ul>

										{/* Learn More Button */}
										<Link
											href="/security"
											className="mt-auto inline-flex h-8 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent bg-card px-3 font-medium text-foreground text-xs shadow-black/15 shadow-sm ring-1 ring-foreground/10 duration-200 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:ring-foreground/15 dark:hover:bg-muted/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
										>
											Learn more
										</Link>
									</div>
								</div>
							</div>

							{/* Right Card (4 cols): Signatures & Chat Visual */}
							<div className="@4xl:col-span-4">
								<div
									aria-hidden="true"
									className="grid h-full grid-cols-6 gap-px bg-[#ebebeb] dark:bg-[#292929]"
								>
									{/* Sub-column 1: 3-row empty spacer */}
									<div className="grid grid-rows-3 gap-y-px *:p-2">
										<div data-grid-content="true" />
										<div data-grid-content="true" />
										<div data-grid-content="true" />
									</div>

									{/* Sub-columns 2-5 (4 cols): Interactive Visuals */}
									<div className="col-span-4 grid grid-rows-3 gap-y-px">
										{/* Row 1: 3 Mini Doc Cards with Signature */}
										<div
											data-grid-content="true"
											className="flex items-center justify-center gap-2 p-4"
										>
											{[0, 1, 2].map((idx) => (
												<div
													key={idx}
													aria-hidden="true"
													className="w-16 space-y-2 rounded-md bg-card p-2 shadow-black/5 shadow-md ring-1 ring-foreground/5"
												>
													<div className="flex items-center gap-1">
														<div className="size-2.5 rounded-full bg-foreground/15" />
														<div className="h-[3px] w-4 rounded-full bg-foreground/15" />
													</div>
													<div className="space-y-1.5">
														<div className="flex items-center gap-1">
															<div className="h-[3px] w-2.5 rounded-full bg-foreground/15" />
															<div className="h-[3px] w-6 rounded-full bg-foreground/15" />
														</div>
														<div className="flex items-center gap-1">
															<div className="h-[3px] w-2.5 rounded-full bg-foreground/15" />
															<div className="h-[3px] w-6 rounded-full bg-foreground/15" />
														</div>
													</div>
													<div className="space-y-1.5">
														<div className="h-[3px] w-full rounded-full bg-foreground/15" />
														<div className="flex items-center gap-1">
															<div className="h-[3px] w-2/3 rounded-full bg-foreground/15" />
															<div className="h-[3px] w-1/3 rounded-full bg-foreground/15" />
														</div>
													</div>
													<Signature className="ml-auto size-3 text-muted-foreground" />
												</div>
											))}
										</div>

										{/* Row 2: Customer Chat Bubble */}
										<div
											data-grid-content="true"
											className="flex flex-col justify-center p-4"
										>
											<div>
												<div className="flex items-center gap-2">
													<span className="text-muted-foreground text-xs">
														M. Irung
													</span>
												</div>
												<div className="mt-1.5 w-4/5 rounded-tl rounded-2xl bg-muted p-3 text-foreground text-xs shadow-black/5 shadow-md ring-1 ring-foreground/5">
													Hey, I'm having trouble with my account.
												</div>
											</div>
										</div>

										{/* Row 3: Support Agent Reply Bubble */}
										<div
											data-grid-content="true"
											className="flex flex-col justify-center p-4"
										>
											<div>
												<div className="mb-1 ml-auto w-4/5 rounded-br rounded-2xl bg-zinc-950 p-3 text-white text-xs shadow-black/5 shadow-md ring-1 ring-white/10 dark:bg-zinc-100 dark:text-zinc-950">
													Distinctio provident nobis repudiandae deleniti
													necessitatibus.
												</div>
												<span className="block text-right text-muted-foreground text-xs">
													Now
												</span>
											</div>
										</div>
									</div>

									{/* Sub-column 6: 3-row empty spacer */}
									<div className="grid grid-rows-3 gap-y-px *:p-2">
										<div data-grid-content="true" />
										<div data-grid-content="true" />
										<div data-grid-content="true" />
									</div>
								</div>
							</div>

							{/* Right border spacer on 4xl screens */}
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

			{/* Part 3: Bottom Features Row */}
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
				<div className="mx-auto w-full max-w-276 max-w-[1104px] lg:min-w-276 lg:min-w-[1104px]">
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
										Effectively manage your time with precision and speed using our
										tools.
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
