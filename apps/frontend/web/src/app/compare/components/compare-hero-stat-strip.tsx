"use client";

import { cn } from "@reloop/ui/cn";

export interface StatItem {
	label: string;
	value: string;
	detail: string;
}

const defaultStats: StatItem[] = [
	{
		label: "Cost Efficiency",
		value: "10x",
		detail: "Lower cost per 100k emails vs legacy providers",
	},
	{
		label: "Open Source Engine",
		value: "100%",
		detail: "Powered by high-throughput KumoMTA core",
	},
	{
		label: "Vendor Lock-in",
		value: "0ms",
		detail: "Standard SMTP & REST APIs; bring your own IPs",
	},
	{
		label: "Global Delivery Latency",
		value: "<50ms",
		detail: "Edge routed transactional delivery pipeline",
	},
];

export function CompareHeroStatStrip({
	stats = defaultStats,
	className,
}: {
	stats?: StatItem[];
	className?: string;
}) {
	return (
		<div
			className={cn(
				"w-full rounded-2xl border border-stroke-soft-200/80 bg-bg-weak-50/50 p-6 sm:p-8 dark:border-white/10 dark:bg-white/[0.02]",
				className,
			)}
		>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
				{stats.map((stat, idx) => (
					<div
						key={stat.label}
						className={cn(
							"flex flex-col justify-between space-y-2",
							idx > 0 &&
								"sm:border-stroke-soft-200 sm:border-l sm:pl-6 lg:pl-8 dark:sm:border-white/10",
						)}
					>
						<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/50">
							{stat.label}
						</p>
						<p className="font-bold font-mono text-[2.2rem] text-text-strong-950 leading-none tracking-tight sm:text-[2.6rem] dark:text-white">
							{stat.value}
						</p>
						<p className="text-[13px] text-text-sub-600 leading-snug dark:text-white/60">
							{stat.detail}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
