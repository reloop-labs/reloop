"use client";

import { Icon } from "@reloop/ui/icon";

const cardClassName =
	"flex flex-col justify-between border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 sm:border-t sm:border-l lg:border-t lg:border-l lg:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 lg:[&:nth-child(-n+3)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+2)]:border-l";

export default function Bento() {
	return (
		<section
			id="capabilities"
			className="relative w-full py-16 sm:py-20 lg:py-24"
		>
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Engineered for Absolute Clarity
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						From raw MTA handshake logs to high-level domain health, Reloop
						provides complete email observability without compromise.
					</p>
				</div>

				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
					{/* Card 1: Sub-Second Stream */}
					<div className={`col-span-1 lg:col-span-2 ${cardClassName}`}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="activity"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Sub-Second Event Ingestion Pipeline
							</h3>
							<p className="max-w-md text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								High-throughput event streaming engine processes deliveries,
								opens, clicks, and bounces in under 25ms. Never wait for daily
								batch jobs to discover delivery issues.
							</p>
						</div>

						<div className="mt-12 grid grid-cols-2 gap-4">
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-4 dark:border-white/10">
								<div className="mb-1 font-mono text-text-soft-400 text-xs dark:text-white/55">
									INGESTION LATENCY
								</div>
								<div className="font-mono font-semibold text-[15px] text-emerald-600 dark:text-emerald-400">
									&lt; 25ms p99
								</div>
								<div className="mt-1 font-mono text-[11px] text-text-soft-400 dark:text-white/30">
									Real-time streaming pipeline
								</div>
							</div>
							<div className="rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-4 dark:border-white/10">
								<div className="mb-1 font-mono text-text-soft-400 text-xs dark:text-white/55">
									EVENT BUFFER
								</div>
								<div className="font-mono font-semibold text-[15px] text-text-strong-950 dark:text-white">
									100,000+ evt/s
								</div>
								<div className="mt-1 font-mono text-[11px] text-text-soft-400 dark:text-white/30">
									Zero message loss guarantee
								</div>
							</div>
						</div>
					</div>

					{/* Card 2: Privacy Filter */}
					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="shield"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Apple MPP & Bot Filtering
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Automatically identify Apple Mail Privacy Protection (MPP) proxy
								pre-fetches and machine scanners to give you genuine human
								engagement statistics.
							</p>
						</div>
						<div className="mt-12 flex items-end justify-between">
							<div>
								<div className="font-bold text-3xl text-primary-base tracking-tight">
									100%
								</div>
								<div className="mt-1 text-[11px] text-text-soft-400 dark:text-white/55">
									Human vs Bot Attribution
								</div>
							</div>
							<div className="rounded-lg border border-stroke-soft-200 bg-bg-soft-50 px-2.5 py-1 font-mono text-[11px] text-text-sub-600 dark:border-white/10 dark:text-white/60">
								RFC 8058 Compliant
							</div>
						</div>
					</div>

					{/* Card 3: Postmaster & ISP Sync */}
					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="globe"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								ISP Postmaster Sync
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Direct integration with Google Workspace and Yahoo Postmaster
								APIs to track domain reputation, IP reputation, and spam rates
								before they hurt your inbox placement.
							</p>
						</div>
						<div className="mt-8 rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-3.5 font-mono text-xs dark:border-white/10">
							<div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
								<span>Google Postmaster</span>
								<span className="font-bold">HIGH REPUTATION</span>
							</div>
							<div className="mt-2 flex items-center justify-between text-emerald-600 dark:text-emerald-400">
								<span>Yahoo Feedback Loop</span>
								<span className="font-bold">0.00% SPAM RATE</span>
							</div>
						</div>
					</div>

					{/* Card 4: Custom Dimensions */}
					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="code"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Custom Tags & Dimensions
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Attach arbitrary metadata to your send payloads. Slice and dice
								metrics by tenant ID, user plan, campaign cohort, or template
								version in real time.
							</p>
						</div>
						<div className="mt-8 rounded-xl border border-stroke-soft-200 bg-[#0a0a0a] p-3 font-mono text-[11px] text-text-sub-600">
							<code className="text-emerald-400">
								tags: &#123; tenant: &quot;enterprise_9&quot;, env:
								&quot;prod&quot; &#125;
							</code>
						</div>
					</div>

					{/* Card 5: Data Warehouse Export */}
					<div className={cardClassName}>
						<div>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name="server"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								Data Warehouse Sync
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Export raw events continuously to your Snowflake, BigQuery,
								ClickHouse, or AWS S3 buckets. Build custom BI dashboards on top
								of your own data warehouse.
							</p>
						</div>
						<div className="mt-8 flex flex-wrap gap-2 font-mono text-[11px]">
							<span className="rounded-md border border-stroke-soft-200 bg-bg-soft-50 px-2 py-1 dark:border-white/10">
								Snowflake
							</span>
							<span className="rounded-md border border-stroke-soft-200 bg-bg-soft-50 px-2 py-1 dark:border-white/10">
								BigQuery
							</span>
							<span className="rounded-md border border-stroke-soft-200 bg-bg-soft-50 px-2 py-1 dark:border-white/10">
								ClickHouse
							</span>
							<span className="rounded-md border border-stroke-soft-200 bg-bg-soft-50 px-2 py-1 dark:border-white/10">
								Amazon S3
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
