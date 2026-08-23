"use client";

import { Icon } from "@reloop/ui/icon";

const STATS = [
	{
		label: "Delivery Success Rate",
		value: "99.4%",
		subtext: "Across global mailbox providers",
	},
	{
		label: "Event Ingestion Latency",
		value: "< 25ms",
		subtext: "Sub-second webhook firing",
	},
	{
		label: "Event Retention",
		value: "365 Days",
		subtext: "Full raw event log history",
	},
	{
		label: "Open Source Engine",
		value: "100%",
		subtext: "Self-hostable or managed cloud",
	},
];

const ISPS = [
	{ name: "Google Workspace & Gmail", rate: "99.8%", status: "Optimal" },
	{ name: "Microsoft 365 & Outlook", rate: "99.3%", status: "Optimal" },
	{ name: "Yahoo & AOL Mail", rate: "99.7%", status: "Optimal" },
	{ name: "Apple iCloud Mail", rate: "99.6%", status: "Optimal" },
];

export default function Metrics() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-y bg-bg-weak-50/50 py-16 sm:py-20 dark:border-white/10 dark:bg-white/[0.01]">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
					{STATS.map((stat) => (
						<div key={stat.label} className="text-center sm:text-left">
							<p className="font-bold text-3xl text-text-strong-950 tracking-tight sm:text-4xl lg:text-5xl dark:text-white">
								{stat.value}
							</p>
							<p className="mt-2 font-semibold text-[15px] text-text-strong-950 dark:text-white/90">
								{stat.label}
							</p>
							<p className="mt-1 text-text-sub-600 text-xs dark:text-white/50">
								{stat.subtext}
							</p>
						</div>
					))}
				</div>

				<div className="mt-16 rounded-3xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:p-8 dark:border-white/10 dark:bg-[#0c0d0e]">
					<div className="flex flex-wrap items-center justify-between gap-4 border-stroke-soft-200 border-b pb-6 dark:border-white/10">
						<div>
							<h3 className="font-semibold text-base text-text-strong-950 dark:text-white">
								Live ISP Deliverability Benchmark
							</h3>
							<p className="mt-1 text-text-sub-600 text-xs dark:text-white/50">
								Continuous synthetic and production inbox placement tracking
							</p>
						</div>
						<div className="flex items-center gap-2 font-mono text-emerald-600 text-xs dark:text-emerald-400">
							<span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
							All Major ISPs Green
						</div>
					</div>

					<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{ISPS.map((isp) => (
							<div
								key={isp.name}
								className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]"
							>
								<div className="flex items-center justify-between">
									<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
										{isp.name}
									</span>
									<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
										{isp.status}
									</span>
								</div>
								<div className="mt-3 flex items-baseline justify-between">
									<span className="text-text-sub-600 text-xs dark:text-white/40">
										Placement Rate
									</span>
									<span className="font-bold font-mono text-base text-text-strong-950 dark:text-white">
										{isp.rate}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
