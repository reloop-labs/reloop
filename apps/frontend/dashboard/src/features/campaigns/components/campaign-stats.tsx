import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import type { CampaignStats } from "../campaign-types";

interface CampaignStatsCardsProps {
	stats: CampaignStats;
	isLoading?: boolean;
}

export function CampaignStatsCards({
	stats,
	isLoading,
}: CampaignStatsCardsProps) {
	const items = [
		{
			label: "Total Campaigns",
			value: stats.totalCampaigns.toLocaleString(),
			icon: "mega-phone",
			subtext: "All-time broadcasts",
		},
		{
			label: "Delivered Emails",
			value: stats.totalDelivered.toLocaleString(),
			icon: "mail-send",
			subtext: "99.2% avg delivery",
		},
		{
			label: "Avg. Open Rate",
			value: `${stats.avgOpenRate}%`,
			icon: "sparkling",
			subtext: "Across sent campaigns",
		},
		{
			label: "Avg. Click Rate",
			value: `${stats.avgClickRate}%`,
			icon: "cursor",
			subtext: "Link engagement",
		},
	];

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
			{items.map((item) => (
				<div
					key={item.label}
					className="flex flex-col justify-between rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 transition-all duration-200 hover:border-stroke-soft-200 dark:border-stroke-soft-100/50"
				>
					<div className="flex items-center justify-between gap-2">
						<span className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
							{item.label}
						</span>
						<div className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-weak-50 dark:border-stroke-soft-100/40">
							<Icon
								name={item.icon}
								className="h-3.5 w-3.5 text-text-sub-600"
							/>
						</div>
					</div>

					<div className="mt-3">
						{isLoading ? (
							<Skeleton className="h-7 w-20 rounded-md" />
						) : (
							<div className="font-semibold text-2xl text-text-strong-950 tabular-nums">
								{item.value}
							</div>
						)}
						<p className="mt-0.5 text-text-sub-600 text-xs">{item.subtext}</p>
					</div>
				</div>
			))}
		</div>
	);
}
