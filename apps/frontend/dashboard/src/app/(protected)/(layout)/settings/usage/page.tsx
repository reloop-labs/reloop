"use client";

import { Icon } from "@reloop/ui/icon";

const UsagePage = () => {
	const usageStats = [
		{ label: "Emails Sent", used: 12450, total: 50000, icon: "mail-single" },
		{ label: "Active Users", used: 420, total: 1000, icon: "users" },
		{ label: "API Requests", used: 85400, total: 100000, icon: "webhook" },
	];

	return (
		<div className="w-full space-y-8 pt-5">
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						Usage Statistics
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Monitor your workspace usage and resource consumption.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6">
					{usageStats.map((stat) => (
						<div
							key={stat.label}
							className="rounded-xl border border-stroke-soft-200 bg-white p-6 shadow-sm"
						>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-alpha-5 border border-stroke-soft-200 text-text-sub-600">
										<Icon name={stat.icon} className="h-4 w-4" />
									</div>
									<p className="font-medium text-label-sm text-text-strong-950">
										{stat.label}
									</p>
								</div>
								<p className="text-paragraph-xs text-text-sub-600">
									<span className="font-semibold text-text-strong-950">
										{stat.used.toLocaleString()}
									</span>
									{" / "}
									{stat.total.toLocaleString()}
								</p>
							</div>

							<div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-alpha-5 border border-stroke-soft-200/50">
								<div
									className="absolute top-0 left-0 h-full bg-text-strong-950 transition-all duration-500"
									style={{ width: `${(stat.used / stat.total) * 100}%` }}
								/>
							</div>

							<div className="mt-3 flex justify-between">
								<p className="text-[10px] font-medium text-text-sub-600 uppercase tracking-wider">
									{Math.round((stat.used / stat.total) * 100)}% Consumed
								</p>
								<p className="text-[10px] font-medium text-text-sub-600 uppercase tracking-wider">
									{(stat.total - stat.used).toLocaleString()} remaining
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Usage Chart Placeholder */}
				<div className="mt-10 rounded-xl border border-stroke-soft-200 bg-white p-6 shadow-sm">
					<div className="flex items-center justify-between mb-8">
						<p className="font-medium text-label-sm text-text-strong-950">
							Email Volume (Last 7 Days)
						</p>
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-1.5">
								<div className="h-2 w-2 rounded-full bg-text-strong-950" />
								<span className="text-[10px] font-medium text-text-sub-600 uppercase tracking-wider">
									Successful
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								<div className="h-2 w-2 rounded-full bg-neutral-alpha-15" />
								<span className="text-[10px] font-medium text-text-sub-600 uppercase tracking-wider">
									Bounced
								</span>
							</div>
						</div>
					</div>

					<div className="flex h-48 items-end gap-2 px-2">
						{[45, 62, 58, 85, 72, 94, 68].map((height, i) => (
							<div key={i} className="group relative flex-1">
								<div
									className="w-full rounded-t-md bg-text-strong-950 transition-all group-hover:bg-text-strong-950/80"
									style={{ height: `${height}%` }}
								/>
								<div className="mt-2 text-center text-[10px] font-medium text-text-sub-600 uppercase">
									{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default UsagePage;
