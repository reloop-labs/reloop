import { Icon } from "@reloop/ui/icon";

export function SpecsBento() {
	return (
		<section className="relative overflow-hidden border-stroke-soft-200 border-t bg-bg-white-0 py-20 sm:py-28 dark:border-white/10 dark:bg-black">
			<div
				aria-hidden
				className="-left-32 pointer-events-none absolute top-1/3 h-[500px] w-[500px] rounded-full bg-orange-500/10 opacity-70 blur-[140px] dark:opacity-40"
			/>
			<div
				aria-hidden
				className="-right-32 pointer-events-none absolute bottom-10 h-[450px] w-[450px] rounded-full bg-orange-500/10 opacity-70 blur-[130px] dark:opacity-40"
			/>
			<div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 md:max-w-7xl lg:px-8">
				<div className="mb-16 text-center sm:mb-20">
					<h2 className="font-semibold text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						SMTP Relay &amp; HTTP APIs
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/50">
						Connect using standard protocols. Run on a zero-latency, failover
						edge mesh network.
					</p>
				</div>

				<div className="grid gap-px overflow-hidden rounded-2xl border border-stroke-soft-200 bg-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10 dark:bg-white/10">
					{/* Card 1: Multi-Protocol */}
					<div className="col-span-1 flex flex-col justify-between bg-bg-white-0 p-8 transition-colors hover:bg-bg-weak-50/50 lg:col-span-2 lg:p-10 dark:bg-black dark:hover:bg-white/[0.02]">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/5">
								<Icon
									name="arrow-swap"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								SMTP Relay &amp; HTTP REST API
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
								Connect via lightweight client SDKs or point your existing
								mailers straight to our relays. Zero configuration migration
								required.
							</p>
						</div>

						<div className="mt-12 grid grid-cols-2 gap-4">
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4 dark:border-white/10 dark:bg-white/5">
								<div className="mb-1 font-mono text-text-sub-600 text-xs dark:text-white/40">
									SMTP HOST
								</div>
								<div className="font-mono font-semibold text-[13px] text-text-strong-950 dark:text-white">
									smtp.reloop.sh
								</div>
								<div className="mt-1 font-mono text-[11px] text-text-sub-600 dark:text-white/40">
									Ports: 587 (TLS), 465 (SSL)
								</div>
							</div>
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-4 dark:border-white/10 dark:bg-white/5">
								<div className="mb-1 font-mono text-text-sub-600 text-xs dark:text-white/40">
									HTTP ENDPOINT
								</div>
								<div className="font-mono font-semibold text-[13px] text-text-strong-950 dark:text-white">
									api.reloop.sh/v1
								</div>
								<div className="mt-1 font-mono text-[11px] text-text-sub-600 dark:text-white/40">
									HTTPS POST /send
								</div>
							</div>
						</div>
					</div>

					{/* Card 2: Latency & SLA */}
					<div className="flex flex-col justify-between bg-bg-white-0 p-8 transition-colors hover:bg-bg-weak-50/50 lg:p-10 dark:bg-black dark:hover:bg-white/[0.02]">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/5">
								<Icon
									name="graph-up"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								99.99% Global Uptime
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
								Reloop routes requests through distributed edge nodes. Built
								for failover safety during cloud zone anomalies.
							</p>
						</div>
						<div className="mt-12 flex items-end justify-between">
							<div>
								<div className="font-bold text-3xl text-text-strong-950 tracking-tight dark:text-white">
									11.8ms
								</div>
								<div className="mt-1 text-[11px] text-text-sub-600 dark:text-white/40">
									Average US-East Delivery
								</div>
							</div>
							{/* Mini Sparkline */}
							<svg
								className="h-8 w-20 text-emerald-500"
								viewBox="0 0 100 30"
								fill="none"
							>
								<path
									d="M0 25 L15 24 L30 18 L45 20 L60 12 L75 14 L90 3 L100 5"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
					</div>

					{/* Card 3: SPF/DKIM */}
					<div className="flex flex-col justify-between bg-bg-white-0 p-8 transition-colors hover:bg-bg-weak-50/50 lg:p-10 dark:bg-black dark:hover:bg-white/[0.02]">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/5">
								<Icon
									name="lock"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Auto-SPF/DKIM Signing
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
								We analyze your domains dynamically and automatically apply
								SPF alignments, custom DKIM signing keys, and DMARC
								validations.
							</p>
						</div>
						<div className="mt-12 flex flex-wrap gap-2">
							<span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">
								DKIM Checked
							</span>
							<span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">
								SPF Alignment Pass
							</span>
						</div>
					</div>

					{/* Card 4: Suppression Sync Webhook */}
					<div className="col-span-1 flex flex-col justify-between bg-bg-white-0 p-8 transition-colors hover:bg-bg-weak-50/50 lg:col-span-2 lg:p-10 dark:bg-black dark:hover:bg-white/[0.02]">
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/5">
								<Icon
									name="webhook"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Suppression List Webhooks
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/60">
								Instantly alerts your app webhooks if an address bounces or
								triggers a spam report, protecting your active mailing list
								quality.
							</p>
						</div>

						<div className="mt-12 space-y-1 rounded-xl bg-[#0a0a0a] p-4 font-mono text-[11px] shadow-inner">
							<div className="mb-2 flex justify-between border-white/5 border-b pb-2 text-white/30">
								<span>WEBHOOK DISPATCH</span>
								<span className="text-emerald-400">ACTIVE</span>
							</div>
							<div className="flex justify-between text-violet-400">
								<span>POST https://yoursite.com/webhooks/reloop</span>
								<span className="text-emerald-400">200 OK</span>
							</div>
							<div className="text-white/40">
								&#123; &quot;event&quot;: &quot;email.bounced&quot;,
								&quot;recipient&quot;: &quot;user@aol.com&quot;,
								&quot;code&quot;: 550 &#125;
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
