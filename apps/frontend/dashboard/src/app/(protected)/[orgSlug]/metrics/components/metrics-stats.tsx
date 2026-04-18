"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

const stats = [
	{
		label: "Total Sent",
		value: "24,592",
		change: "+12.5%",
		icon: "send-2",
		color: "text-blue-500",
	},
	{
		label: "Delivered",
		value: "24,103",
		change: "+11.8%",
		icon: "check-circle",
		color: "text-success-base",
	},
	{
		label: "Opened",
		value: "18,942",
		change: "+8.2%",
		icon: "eye",
		color: "text-purple-500",
	},
	{
		label: "Clicked",
		value: "4,231",
		change: "+4.1%",
		icon: "cursor-click",
		color: "text-orange-500",
	},
];

export function MetricsStats() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat) => (
				<div
					key={stat.label}
					className="flex flex-col gap-4 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-5 shadow-sm transition-all hover:border-stroke-soft-300 hover:shadow-md"
				>
					<div className="flex items-center justify-between">
						<div
							className={cn(
								"flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5",
								stat.color,
							)}
						>
							<Icon name={stat.icon} className="h-5 w-5" />
						</div>
						<span className="font-medium text-paragraph-xs text-success-base">
							{stat.change}
						</span>
					</div>
					<div>
						<p className="font-medium text-paragraph-sm text-text-sub-600">
							{stat.label}
						</p>
						<h3 className="font-bold text-3xl text-text-strong-950 tracking-tight">
							{stat.value}
						</h3>
					</div>
				</div>
			))}
		</div>
	);
}
