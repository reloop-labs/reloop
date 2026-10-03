import {
	Activity,
	Ban,
	BadgeCheck,
	Fingerprint,
	List,
	Lock,
	Server,
	ShieldCheck,
	Undo2,
	Zap,
} from "lucide-react";

export function DataVisualization() {
	return (
		<section
			aria-labelledby="data-visualization-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			{/* Header Block */}
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
								Everything you need to reach the inbox
							</h2>
							<p className="text-balance text-lg text-muted-foreground">
								Authentication, reputation, and monitoring — built in, so your
								emails land where they belong.
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

			{/* Bottom Features Row: Deliverability grid (from reference) */}
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

				{/* Center Content: 5 x 2 deliverability grid */}
				<div className="mx-auto w-full max-w-276 max-w-[1280px] lg:min-w-276 lg:min-w-[1280px]">
					<div className="grid grid-cols-2 bg-[#ebebeb] *:p-[0.5px] **:data-grid-content:h-full **:data-grid-content:rounded **:data-grid-content:bg-card/90 **:data-grid-content:p-6 @4xl:grid-cols-10 @4xl:**:data-grid-content:p-8 @5xl:**:data-grid-content:p-12 dark:bg-[#292929]">
						<div aria-hidden="true" className="@max-4xl:hidden">
							<div data-grid-content="true" />
						</div>
						<div className="col-span-8 grid gap-px @sm:grid-cols-2 @4xl:grid-cols-4">
							<div>
								<div data-grid-content="true" className="space-y-3">
									<Ban className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Proactive blocklist tracking
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Catch DNSBL and RBL listings before they hurt delivery.
									</p>
								</div>
							</div>
							<div>
								<div data-grid-content="true" className="space-y-3">
									<BadgeCheck className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Build confidence with BIMI
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Show your logo on authenticated mail with BIMI.
									</p>
								</div>
							</div>
							<div>
								<div data-grid-content="true" className="space-y-3">
									<Server className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Managed dedicated IPs
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										A dedicated IP that warms with your sending volume.
									</p>
								</div>
							</div>
							<div>
								<div data-grid-content="true" className="space-y-3">
									<Undo2 className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Smart bounce handling
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Distinguish hard from soft bounces and auto-retry with care.
									</p>
								</div>
							</div>
							<div>
								<div data-grid-content="true" className="space-y-3">
									<ShieldCheck className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Phishing protection
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Detect lookalike domains and block impersonation attacks.
									</p>
								</div>
							</div>
							<div>
								<div data-grid-content="true" className="space-y-3">
									<Lock className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Strict TLS delivery
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Enforce STARTTLS on every hop so messages stay private.
									</p>
								</div>
							</div>
							<div>
								<div data-grid-content="true" className="space-y-3">
									<List className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Dynamic suppression list
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Never mail bounces, complaints, or unsubs.
									</p>
								</div>
							</div>
							<div>
								<div data-grid-content="true" className="space-y-3">
									<Activity className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										IP and domain monitoring
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Watch DNS and IP reputation. Get told when they drift.
									</p>
								</div>
							</div>
							<div className="@4xl:col-span-2">
								<div data-grid-content="true" className="space-y-3">
									<Fingerprint className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Prevent spoofing
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										DMARC stops impersonation before it hits the inbox.
									</p>
								</div>
							</div>
							<div className="@4xl:col-span-2">
								<div data-grid-content="true" className="space-y-3">
									<Zap className="size-4" strokeWidth={2} />
									<h3 className="mt-3 font-medium text-foreground">
										Automated IP warmup
									</h3>
									<p className="line-clamp-2 text-muted-foreground text-sm">
										Volume ramps that protect your warmup.
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
