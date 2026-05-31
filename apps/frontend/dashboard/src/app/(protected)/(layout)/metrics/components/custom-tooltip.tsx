interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		payload: {
			date: string;
			sent?: number;
			bounced?: number;
			rate?: number;
			deliveryRate?: number;
		};
	}>;
}

export const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (!active || !payload || !payload.length) return null;

	const payloadItem = payload[0];
	if (!payloadItem) return null;

	const data = payloadItem.payload;
	const sent = data.sent ?? 0;
	const bounced = data.bounced ?? 0;
	const deliveryRate =
		data.rate !== undefined ? data.rate : (data.deliveryRate ?? 0);

	return (
		<div className="flex min-w-[190px] flex-col gap-3 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-4 shadow-lg dark:border-stroke-soft-100/50 dark:bg-zinc-950">
			{/* Date Header */}
			<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2 dark:border-stroke-soft-100/30">
				<span className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider">
					{data.date}
				</span>
			</div>

			{/* Main Metrics (Sent and Bounced) */}
			<div className="flex flex-col gap-2">
				{/* Emails Sent */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-text-disabled-300" />
						<span className="text-text-sub-600 text-xs">Emails Sent</span>
					</div>
					<span className="font-semibold text-text-main-900 text-xs">
						{sent.toLocaleString()}
					</span>
				</div>

				{/* Bounces */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-[#F04438]" />
						<span className="text-text-sub-600 text-xs">Bounces</span>
					</div>
					<span className="font-semibold text-text-main-900 text-xs">
						{bounced.toLocaleString()}
					</span>
				</div>
			</div>

			{/* Delivery Rate (Below the stats) */}
			<div className="flex flex-col gap-1 border-stroke-soft-100 border-t pt-2.5 dark:border-stroke-soft-100/30">
				<span className="font-medium text-[10px] text-text-disabled-300 uppercase tracking-wider">
					Delivery Rate
				</span>
				<span className="font-bold text-text-main-900 text-xl tracking-tight">
					{Math.round(deliveryRate * 100) / 100}%
				</span>
			</div>
		</div>
	);
};
